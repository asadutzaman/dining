<?php

namespace App\Services\Dining;

use App\Interfaces\SmsGatewayInterface;
use App\Models\Dining\Member;
use App\Models\Dining\MemberOtp;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

/**
 * Phone + OTP login for dining members.
 *
 * Two rules shape this class:
 *
 *  1. Requesting a code never reveals whether a phone belongs to a member. The
 *     response is identical either way, so the endpoint cannot be used to
 *     enumerate who eats at the hall.
 *  2. Codes are stored only as hashes and are burned after use, expiry, or too
 *     many wrong guesses.
 */
class MemberAuthService
{
    private SmsGatewayInterface $sms;

    private PhoneNumberService $phones;

    public function __construct(SmsGatewayInterface $sms, PhoneNumberService $phones)
    {
        $this->sms    = $sms;
        $this->phones = $phones;
    }

    /**
     * Issue a login code. Returns what the client may safely know: how long the
     * code lasts and when it may ask for another.
     *
     * @throws \Exception on an invalid number or when the phone is rate limited
     */
    public function requestOtp(string $phone, ?string $ip = null): array
    {
        $local = $this->phones->normalize($phone);

        if (!$this->phones->isValid($local)) {
            throw new \Exception('Please enter a valid Bangladeshi mobile number.');
        }

        $config = config('sms.otp');

        $this->assertNotRateLimited($local, $config);

        // May be null -- we still record the request and return success.
        $member = $this->findMemberByPhone($local);

        $code = $this->generateCode($local, $config);

        MemberOtp::create([
            'phone'      => $local,
            'member_id'  => $member?->id,
            'otp_hash'   => Hash::make($code),
            'expires_at' => now()->addSeconds($config['ttl_seconds']),
            'request_ip' => $ip,
        ]);

        // Only actually send when there is someone to send to. An unenrolled
        // number silently receives nothing, but sees the same API response.
        if ($member && !$this->isDemo($local, $config)) {
            $minutes = max(1, (int) round($config['ttl_seconds'] / 60));
            $this->sms->send(
                $local,
                "{$code} is your KhaiDai login code. It expires in {$minutes} minutes. Do not share it with anyone."
            );
        }

        return [
            'phone'            => $this->phones->mask($local),
            'expires_in'       => $config['ttl_seconds'],
            'resend_available_in' => $config['resend_cooldown_seconds'],
        ];
    }

    /**
     * Exchange a code for an access token.
     *
     * @throws \Exception when the code is wrong, expired, used, or exhausted
     */
    public function verifyOtp(string $phone, string $code, array $device = []): array
    {
        $local  = $this->phones->normalize($phone);
        $config = config('sms.otp');

        if ($this->bypassEnabled()) {
            return $this->signInWithoutVerification($local, $device);
        }

        return DB::transaction(function () use ($local, $code, $device, $config) {
            $otp = MemberOtp::query()
                ->where('phone', $local)
                ->whereNull('consumed_at')
                ->orderByDesc('id')
                ->lockForUpdate()
                ->first();

            if (!$otp) {
                throw new \Exception('Request a new code to continue.');
            }

            if ($otp->isExpired()) {
                throw new \Exception('That code has expired. Request a new one.');
            }

            if ($otp->attempt_count >= $config['max_attempts']) {
                throw new \Exception('Too many incorrect attempts. Request a new code.');
            }

            if (!Hash::check($code, $otp->otp_hash)) {
                $otp->increment('attempt_count');

                $left = max(0, $config['max_attempts'] - $otp->attempt_count);
                throw new \Exception(
                    $left > 0
                        ? "Incorrect code. {$left} attempt(s) left."
                        : 'Too many incorrect attempts. Request a new code.'
                );
            }

            // Correct. Burn the code before anything else can fail.
            $otp->consumed_at = now();
            $otp->save();

            // Resolved now rather than trusting the id captured at request time,
            // in case membership changed between the two calls.
            $member = $this->findMemberByPhone($local);

            if (!$member) {
                throw new \Exception('This number is not registered for dining. Please contact the dining office.');
            }

            if ((int) $member->status !== 1) {
                throw new \Exception('Your dining membership is inactive. Please contact the dining office.');
            }

            $member->last_login_at = now();
            $member->save();

            return [
                'member' => $member,
                'token'  => $this->issueToken($member, $device),
            ];
        });
    }

    /**
     * Is the development bypass active?
     *
     * The production check is deliberately here rather than left to whoever
     * writes the .env: a stray MEMBER_OTP_BYPASS=true copied into a live
     * environment would otherwise hand every account to anyone who knows a
     * phone number.
     */
    private function bypassEnabled(): bool
    {
        return (bool) config('sms.otp.bypass_verification')
            && !app()->environment('production');
    }

    /**
     * DEVELOPMENT ONLY. Signs in on the phone number alone, without checking any
     * code. Reached only when bypassEnabled() is true.
     *
     * Membership is still enforced -- an unknown or deactivated number is
     * rejected exactly as it would be normally -- so this shortens the login
     * flow without changing who is allowed in.
     *
     * @throws \Exception when the number belongs to no active member
     */
    private function signInWithoutVerification(?string $phone, array $device = []): array
    {
        $member = $this->findMemberByPhone($phone);

        if (!$member) {
            throw new \Exception('This number is not registered for dining. Please contact the dining office.');
        }

        if ((int) $member->status !== 1) {
            throw new \Exception('Your dining membership is inactive. Please contact the dining office.');
        }

        // Logged at warning level on every use so it is impossible to leave this
        // on unnoticed -- the log makes the bypass obvious in any review.
        Log::warning('[MemberAuth] OTP verification BYPASSED (MEMBER_OTP_BYPASS is on)', [
            'member_id'   => $member->id,
            'member_code' => $member->member_code,
            'environment' => app()->environment(),
        ]);

        $member->last_login_at = now();
        $member->save();

        return [
            'member' => $member,
            'token'  => $this->issueToken($member, $device),
        ];
    }

    /**
     * Mint a Sanctum token for this device, replacing any token the same device
     * already holds so a reinstall does not leave a valid token behind.
     */
    public function issueToken(Member $member, array $device = []): array
    {
        $config     = config('sms.token');
        $deviceName = $device['device_id'] ?? $device['device_model'] ?? 'mobile';
        $tokenName  = $config['name'] . ':' . $deviceName;

        if ($config['single_per_device']) {
            $member->tokens()->where('name', $tokenName)->delete();
        }

        $expiresAt = $config['ttl_days'] > 0
            ? now()->addDays($config['ttl_days'])
            : null;

        $token = $member->createToken($tokenName, ['member'], $expiresAt);

        return [
            'access_token' => $token->plainTextToken,
            'token_type'   => 'Bearer',
            'expires_at'   => $expiresAt?->format('Y-m-d H:i:s'),
        ];
    }

    /**
     * Exactly one active member must own a phone for login to be unambiguous.
     * Duplicates are a data problem the dining office has to resolve, so we
     * refuse rather than picking one arbitrarily.
     *
     * @throws \Exception when several active members share the number
     */
    public function findMemberByPhone(?string $phone): ?Member
    {
        $variants = $this->phones->variants($phone);

        if (empty($variants)) {
            return null;
        }

        $matches = Member::query()
            ->whereIn('phone', $variants)
            ->where('status', 1)
            ->get();

        if ($matches->count() > 1) {
            throw new \Exception('This number is registered to more than one member. Please contact the dining office.');
        }

        return $matches->first();
    }

    private function assertNotRateLimited(string $phone, array $config): void
    {
        $latest = MemberOtp::query()
            ->where('phone', $phone)
            ->orderByDesc('id')
            ->first();

        if ($latest) {
            $waited = $latest->created_at->diffInSeconds(now());
            if ($waited < $config['resend_cooldown_seconds']) {
                $wait = $config['resend_cooldown_seconds'] - $waited;
                throw new \Exception("Please wait {$wait} seconds before requesting another code.");
            }
        }

        $recent = MemberOtp::query()
            ->where('phone', $phone)
            ->where('created_at', '>=', now()->subSeconds($config['rate_window_seconds']))
            ->count();

        if ($recent >= $config['max_per_window']) {
            throw new \Exception('Too many login codes requested. Please try again later.');
        }
    }

    private function generateCode(string $phone, array $config): string
    {
        if ($this->isDemo($phone, $config)) {
            return (string) $config['demo_code'];
        }

        $max = (10 ** $config['length']) - 1;

        return str_pad((string) random_int(0, $max), $config['length'], '0', STR_PAD_LEFT);
    }

    /**
     * The nominated review/QA number, which uses a fixed code and sends no SMS.
     */
    private function isDemo(string $phone, array $config): bool
    {
        $demo = $this->phones->normalize($config['demo_phone'] ?? null);

        return $demo !== null && !empty($config['demo_code']) && $demo === $phone;
    }

    public function logout(Member $member, bool $allDevices = false): void
    {
        if ($allDevices) {
            $member->tokens()->delete();

            return;
        }

        $current = $member->currentAccessToken();
        if ($current) {
            $current->delete();
        }
    }

    /**
     * Codes that are spent or long expired carry no value; the nightly cleanup
     * drops them so the table stays small.
     */
    public function pruneOtps(int $olderThanDays = 7): int
    {
        return MemberOtp::query()
            ->where('created_at', '<', Carbon::now()->subDays($olderThanDays))
            ->delete();
    }
}
