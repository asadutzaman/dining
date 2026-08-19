<?php

namespace App\Http\Controllers\Api\Mobile;

use App\Http\Resources\Dining\MemberProfileResource;
use App\Models\Dining\MemberDevice;
use App\Services\Dining\MemberAuthService;
use Illuminate\Http\Request;

class AuthController extends BaseMobileController
{
    private MemberAuthService $auth;

    public function __construct(MemberAuthService $auth)
    {
        $this->auth = $auth;
    }

    /**
     * POST /api/mobile/v1/auth/request-otp
     *
     * Always succeeds for a well-formed number, whether or not it belongs to a
     * member -- see MemberAuthService for why.
     */
    public function requestOtp(Request $request)
    {
        return $this->handle(function () use ($request) {
            $input = $this->check($request->all(), [
                'phone' => ['required', 'string', 'max:20'],
            ], [
                'phone.required' => 'Mobile number is required.',
            ]);

            $result = $this->auth->requestOtp($input['phone'], $request->ip());

            return $this->ok($result, 'If this number is registered, a login code is on its way.');
        });
    }

    /**
     * POST /api/mobile/v1/auth/verify-otp
     */
    public function verifyOtp(Request $request)
    {
        return $this->handle(function () use ($request) {
            $input = $this->check($request->all(), [
                'phone'        => ['required', 'string', 'max:20'],
                'code'         => ['required', 'string', 'max:10'],
                'device_id'    => ['nullable', 'string', 'max:120'],
                'device_model' => ['nullable', 'string', 'max:120'],
                'platform'     => ['nullable', 'in:ANDROID,IOS'],
                'app_version'  => ['nullable', 'string', 'max:32'],
                'push_token'   => ['nullable', 'string', 'max:255'],
            ], [
                'code.required' => 'Enter the code we sent you.',
            ]);

            $result = $this->auth->verifyOtp($input['phone'], $input['code'], $input);
            $member = $result['member'];

            if (!empty($input['push_token'])) {
                $this->rememberDevice($member->id, $input);
            }

            return $this->ok([
                'token'  => $result['token'],
                'member' => new MemberProfileResource($member),
            ], 'Signed in.');
        });
    }

    /**
     * GET /api/mobile/v1/auth/me
     */
    public function me()
    {
        return $this->handle(function () {
            return $this->ok(new MemberProfileResource($this->member()));
        });
    }

    /**
     * POST /api/mobile/v1/auth/logout
     */
    public function logout(Request $request)
    {
        return $this->handle(function () use ($request) {
            $member = $this->member();

            // Signing out should stop notifications reaching this handset.
            if ($request->filled('push_token')) {
                MemberDevice::query()
                    ->where('member_id', $member->id)
                    ->where('push_token', $request->input('push_token'))
                    ->delete();
            }

            $this->auth->logout($member, $request->boolean('all_devices'));

            return $this->ok(null, 'Signed out.');
        });
    }

    /**
     * POST /api/mobile/v1/auth/device
     *
     * Called on launch and whenever FCM rotates the token.
     */
    public function registerDevice(Request $request)
    {
        return $this->handle(function () use ($request) {
            $input = $this->check($request->all(), [
                'push_token'   => ['required', 'string', 'max:255'],
                'platform'     => ['nullable', 'in:ANDROID,IOS'],
                'app_version'  => ['nullable', 'string', 'max:32'],
                'device_model' => ['nullable', 'string', 'max:120'],
            ]);

            $this->rememberDevice($this->member()->id, $input);

            return $this->ok(null, 'Device registered.');
        });
    }

    /**
     * A push token identifies a handset, not a person. Re-registering an existing
     * token reassigns it, so a shared or resold device stops receiving the
     * previous member's notifications.
     */
    private function rememberDevice(int $memberId, array $input): void
    {
        MemberDevice::updateOrCreate(
            ['push_token' => $input['push_token']],
            [
                'member_id'    => $memberId,
                'platform'     => $input['platform'] ?? 'ANDROID',
                'app_version'  => $input['app_version'] ?? null,
                'device_model' => $input['device_model'] ?? null,
                'last_seen_at' => now(),
                'status'       => 1,
            ]
        );
    }
}
