<?php

namespace App\Services\Dining;

use App\Models\Dining\MealBooking;
use App\Models\Dining\MealSetting;
use App\Models\Dining\Member;
use App\Repositories\Dining\MealBookingRepository;
use App\Repositories\Dining\MealSettingRepository;
use App\Repositories\Dining\MemberRepository;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * The booking domain. Every path that creates, cancels or settles a booking goes
 * through here so the cutoff rule and the due-balance arithmetic exist in exactly
 * one place -- the app, the counter and the nightly sweep cannot drift apart.
 */
class MealBookingService
{
    public const MEAL_TYPES = ['BREAKFAST', 'LUNCH', 'DINNER'];

    /** Cell states the client renders. */
    public const STATE_AVAILABLE = 'AVAILABLE';
    public const STATE_BOOKED    = 'BOOKED';
    public const STATE_CONSUMED  = 'CONSUMED';
    public const STATE_MISSED    = 'MISSED';
    public const STATE_CANCELLED = 'CANCELLED';

    private MealBookingRepository $bookings;

    private MealSettingRepository $settings;

    private MemberRepository $members;

    /** Effective meal settings, memoised per date within a single request. */
    private array $settingCache = [];

    public function __construct(
        ?MealBookingRepository $bookings = null,
        ?MealSettingRepository $settings = null,
        ?MemberRepository $members = null
    ) {
        $this->bookings = $bookings ?: new MealBookingRepository();
        $this->settings = $settings ?: new MealSettingRepository();
        $this->members  = $members ?: new MemberRepository();
    }

    /* ------------------------------------------------------------------ */
    /* Reading                                                             */
    /* ------------------------------------------------------------------ */

    /**
     * The booking grid for a member over a date range: one entry per day, each
     * carrying a cell per meal type. Backs the home screen, the weekly grid and
     * the single-day picker from one shape.
     */
    public function planForRange(Member $member, $from, $to): array
    {
        $from = Carbon::parse($from)->startOfDay();
        $to   = Carbon::parse($to)->startOfDay();

        $existing = $this->bookings->keyedForRange($member->id, $from->format('Y-m-d'), $to->format('Y-m-d'));

        $days = [];
        for ($date = $from->copy(); $date->lte($to); $date->addDay()) {
            $days[] = $this->planForDay($member, $date, $existing);
        }

        return $days;
    }

    public function planForDay(Member $member, $date, ?array $existing = null): array
    {
        $date = Carbon::parse($date)->startOfDay();
        $key  = $date->format('Y-m-d');

        if ($existing === null) {
            $existing = $this->bookings->keyedForRange($member->id, $key, $key);
        }

        $cells = [];
        $bookedCount = 0;
        $dayTotal = 0.0;

        foreach (self::MEAL_TYPES as $mealType) {
            $cell = $this->buildCell($date, $mealType, $existing[$key . '|' . $mealType] ?? null);
            if ($cell['state'] === self::STATE_BOOKED) {
                $bookedCount++;
                $dayTotal += (float) $cell['price'];
            }
            $cells[] = $cell;
        }

        return [
            'meal_date'    => $key,
            'day_short'    => $date->format('D'),
            'day_full'     => $date->format('l'),
            'day_of_month' => (int) $date->format('j'),
            'is_today'     => $date->isToday(),
            'booked_count' => $bookedCount,
            'day_total'    => round($dayTotal, 2),
            'meals'        => $cells,
        ];
    }

    /**
     * Resolve one (date, meal) cell into everything the client needs to both
     * render it and know which gestures are legal.
     */
    private function buildCell(Carbon $date, string $mealType, ?MealBooking $booking): array
    {
        $setting = $this->settingFor($mealType, $date);

        // No effective price setting means the meal simply is not on offer.
        if (!$setting) {
            return [
                'meal_type'    => $mealType,
                'price'        => 0,
                'state'        => self::STATE_AVAILABLE,
                'locked'       => true,
                'can_book'     => false,
                'can_cancel'   => false,
                'cutoff_at'    => null,
                'cutoff_label' => 'Not served',
                'serving_from' => null,
                'serving_to'   => null,
                'token_number' => null,
                'consumed_at'  => null,
                'charge_status'  => null,
                'charged_amount' => 0,
            ];
        }

        $cutoffAt = $setting->cutoffFor($date);
        $locked   = $cutoffAt !== null && now()->greaterThan($cutoffAt);

        $state = self::STATE_AVAILABLE;
        if ($booking) {
            $state = match ($booking->booking_status) {
                MealBooking::STATUS_CONSUMED  => self::STATE_CONSUMED,
                MealBooking::STATUS_MISSED    => self::STATE_MISSED,
                MealBooking::STATUS_BOOKED    => self::STATE_BOOKED,
                default                       => self::STATE_AVAILABLE,
            };
        }

        // A settled meal is history: no gesture applies regardless of the clock.
        $settled = in_array($state, [self::STATE_CONSUMED, self::STATE_MISSED], true);

        return [
            'meal_type'    => $mealType,
            'price'        => (float) ($booking->unit_price ?? $setting->cost),
            'state'        => $state,
            'locked'       => $locked || $settled,
            'can_book'     => !$settled && !$locked && $state !== self::STATE_BOOKED,
            'can_cancel'   => !$settled && !$locked && $state === self::STATE_BOOKED,
            'cutoff_at'    => $cutoffAt?->format('Y-m-d H:i:s'),
            'cutoff_label' => $locked
                ? 'Cutoff passed — walk-in only'
                : $setting->cutoffLabel(),
            'serving_from' => $setting->start_time,
            'serving_to'   => $setting->end_time,
            'token_number' => $booking?->mealToken?->token_number,
            'consumed_at'  => $booking?->mealToken?->collected_at?->format('Y-m-d H:i:s'),
            'charge_status'  => $booking?->charge_status,
            'charged_amount' => (float) ($booking->charged_amount ?? 0),
        ];
    }

    private function settingFor(string $mealType, Carbon $date): ?MealSetting
    {
        $key = $mealType . '|' . $date->format('Y-m-d');

        if (!array_key_exists($key, $this->settingCache)) {
            $this->settingCache[$key] = $this->settings->getEffectiveCost($mealType, $date->format('Y-m-d'));
        }

        return $this->settingCache[$key];
    }

    /* ------------------------------------------------------------------ */
    /* Writing                                                             */
    /* ------------------------------------------------------------------ */

    /**
     * Book one meal. Idempotent: booking something already booked is a no-op
     * rather than an error, so a retried request cannot double-charge.
     *
     * @throws \Exception when the meal is not offered, already settled, or past cutoff
     */
    public function book(Member $member, $mealDate, string $mealType, string $source = 'APP'): MealBooking
    {
        return DB::transaction(function () use ($member, $mealDate, $mealType, $source) {
            $date    = Carbon::parse($mealDate)->startOfDay();
            $setting = $this->settingFor($mealType, $date);

            if (!$setting) {
                throw new \Exception("No cost setting is configured for {$mealType} on {$date->format('d M Y')}!");
            }

            $cutoffAt = $setting->cutoffFor($date);
            if ($cutoffAt !== null && now()->greaterThan($cutoffAt)) {
                throw new \Exception(
                    ucfirst(strtolower($mealType)) . ' for ' . $date->format('D d M') .
                    ' closed at ' . $cutoffAt->format('g:i A') . ' — walk-in only.'
                );
            }

            $booking = $this->lockRow($member->id, $date->format('Y-m-d'), $mealType);

            if ($booking) {
                if (in_array($booking->booking_status, [MealBooking::STATUS_CONSUMED, MealBooking::STATUS_MISSED], true)) {
                    throw new \Exception('This meal has already been settled and cannot be re-booked.');
                }
                if ($booking->booking_status === MealBooking::STATUS_BOOKED) {
                    return $booking; // Already booked -- nothing to do.
                }

                // Reviving a cancelled row: re-quote at the current price.
                $booking->fill([
                    'booking_status' => MealBooking::STATUS_BOOKED,
                    'charge_status'  => MealBooking::CHARGE_PENDING,
                    'charged_amount' => 0,
                    'unit_price'     => $setting->cost,
                    'cutoff_at'      => $cutoffAt,
                    'booked_at'      => now(),
                    'cancelled_at'   => null,
                    'source'         => $source,
                ])->save();

                return $booking->refresh();
            }

            return $this->bookings->create([
                'member_id'      => $member->id,
                'meal_date'      => $date->format('Y-m-d'),
                'meal_type'      => $mealType,
                'unit_price'     => $setting->cost,
                'cutoff_at'      => $cutoffAt,
                'booking_status' => MealBooking::STATUS_BOOKED,
                'charge_status'  => MealBooking::CHARGE_PENDING,
                'source'         => $source,
                'booked_at'      => now(),
            ]);
        });
    }

    /**
     * Cancel one meal, free of charge, provided its cutoff has not passed.
     * Idempotent in the same way book() is.
     *
     * @throws \Exception when the meal is already settled or past cutoff
     */
    public function cancel(Member $member, $mealDate, string $mealType): ?MealBooking
    {
        return DB::transaction(function () use ($member, $mealDate, $mealType) {
            $date    = Carbon::parse($mealDate)->startOfDay();
            $booking = $this->lockRow($member->id, $date->format('Y-m-d'), $mealType);

            if (!$booking || $booking->booking_status === MealBooking::STATUS_CANCELLED) {
                return $booking; // Nothing booked -- already in the desired state.
            }

            if (in_array($booking->booking_status, [MealBooking::STATUS_CONSUMED, MealBooking::STATUS_MISSED], true)) {
                throw new \Exception('This meal has already been settled and cannot be cancelled.');
            }

            if ($booking->isLocked()) {
                throw new \Exception(
                    ucfirst(strtolower($mealType)) . ' for ' . $date->format('D d M') .
                    ' closed at ' . $booking->cutoff_at->format('g:i A') . ' and can no longer be cancelled.'
                );
            }

            // Cancelling before cutoff is free. If a charge had somehow been
            // posted already, reverse it so the member is not billed for a meal
            // the kitchen was told not to cook.
            if ($booking->charge_status === MealBooking::CHARGE_CHARGED && (float) $booking->charged_amount > 0) {
                $this->members->decrementDueBalance($member->id, $booking->charged_amount);
            }

            $booking->fill([
                'booking_status' => MealBooking::STATUS_CANCELLED,
                'charge_status'  => MealBooking::CHARGE_WAIVED,
                'charged_amount' => 0,
                'cancelled_at'   => now(),
            ])->save();

            return $booking->refresh();
        });
    }

    /**
     * Make a day's bookings match exactly the given set of meals -- the "Confirm"
     * action on the single-day and weekly screens, where the client sends the
     * desired end state rather than a diff.
     *
     * Meals whose cutoff has passed are reported as skipped instead of failing
     * the whole request: a stale grid should still save everything it legally can.
     *
     * @param  string[] $mealTypes
     * @return array{booked: string[], cancelled: string[], skipped: array<int, array{meal_type: string, reason: string}>}
     */
    public function syncDay(Member $member, $mealDate, array $mealTypes, string $source = 'APP'): array
    {
        $wanted = array_values(array_intersect(self::MEAL_TYPES, array_map('strtoupper', $mealTypes)));

        $result = ['booked' => [], 'cancelled' => [], 'skipped' => []];

        foreach (self::MEAL_TYPES as $mealType) {
            try {
                if (in_array($mealType, $wanted, true)) {
                    $before = $this->bookings->findFor($member->id, Carbon::parse($mealDate)->format('Y-m-d'), $mealType);
                    if ($before && $before->booking_status === MealBooking::STATUS_BOOKED) {
                        continue; // Unchanged.
                    }
                    $this->book($member, $mealDate, $mealType, $source);
                    $result['booked'][] = $mealType;
                } else {
                    $before = $this->bookings->findFor($member->id, Carbon::parse($mealDate)->format('Y-m-d'), $mealType);
                    if (!$before || $before->booking_status !== MealBooking::STATUS_BOOKED) {
                        continue; // Unchanged.
                    }
                    $this->cancel($member, $mealDate, $mealType);
                    $result['cancelled'][] = $mealType;
                }
            } catch (\Exception $e) {
                $result['skipped'][] = ['meal_type' => $mealType, 'reason' => $e->getMessage()];
            }
        }

        return $result;
    }

    /**
     * Apply a whole week's grid in one call.
     *
     * @param  array<int, array{meal_date: string, meal_types: string[]}> $days
     */
    public function syncRange(Member $member, array $days, string $source = 'APP'): array
    {
        $summary = ['booked' => 0, 'cancelled' => 0, 'skipped' => []];

        foreach ($days as $day) {
            $outcome = $this->syncDay($member, $day['meal_date'], $day['meal_types'] ?? [], $source);

            $summary['booked']    += count($outcome['booked']);
            $summary['cancelled'] += count($outcome['cancelled']);

            foreach ($outcome['skipped'] as $skip) {
                $summary['skipped'][] = array_merge(['meal_date' => $day['meal_date']], $skip);
            }
        }

        return $summary;
    }

    /* ------------------------------------------------------------------ */
    /* Settlement                                                          */
    /* ------------------------------------------------------------------ */

    /**
     * Mark a booking consumed because the member scanned at the counter, and post
     * the charge. Called from the counter flow, inside its transaction.
     */
    public function markConsumed(MealBooking $booking, $mealTokenId = null): MealBooking
    {
        if ($booking->booking_status === MealBooking::STATUS_CONSUMED) {
            return $booking;
        }

        $charge = (float) $booking->unit_price;

        $booking->fill([
            'booking_status' => MealBooking::STATUS_CONSUMED,
            'meal_token_id'  => $mealTokenId ?? $booking->meal_token_id,
            'charge_status'  => MealBooking::CHARGE_CHARGED,
            'charged_amount' => $charge,
            'settled_at'     => now(),
        ])->save();

        if ($charge > 0) {
            $this->members->incrementDueBalance($booking->member_id, $charge);
        }

        return $booking->refresh();
    }

    /**
     * A booking whose meal has passed with no scan. The member reserved food that
     * was cooked for them, so it is charged -- this is the "Missed — still
     * charged" row in the app.
     */
    public function markMissed(MealBooking $booking): MealBooking
    {
        $charge = (float) $booking->unit_price;

        $booking->fill([
            'booking_status' => MealBooking::STATUS_MISSED,
            'charge_status'  => MealBooking::CHARGE_CHARGED,
            'charged_amount' => $charge,
            'settled_at'     => now(),
        ])->save();

        if ($charge > 0) {
            $this->members->incrementDueBalance($booking->member_id, $charge);
        }

        return $booking->refresh();
    }

    /* ------------------------------------------------------------------ */
    /* Suggestions                                                         */
    /* ------------------------------------------------------------------ */

    /**
     * "Repeat my usual week": for each weekday/meal, propose it when the member
     * took it in the majority of the last few weeks. Returns the same day/meal
     * shape syncRange() consumes, with locked cells already filtered out.
     */
    public function suggestUsualWeek(Member $member, $from, $to, int $lookbackWeeks = 4): array
    {
        $from = Carbon::parse($from)->startOfDay();
        $to   = Carbon::parse($to)->startOfDay();

        $historyFrom = $from->copy()->subWeeks($lookbackWeeks);
        $counts      = $this->bookings->habitCounts($member->id, $historyFrom->format('Y-m-d'), $from->copy()->subDay()->format('Y-m-d'));

        $threshold = max(1, (int) ceil($lookbackWeeks / 2));

        $days = [];
        for ($date = $from->copy(); $date->lte($to); $date->addDay()) {
            $mealTypes = [];
            foreach (self::MEAL_TYPES as $mealType) {
                $taken = $counts[$date->dayOfWeek . '|' . $mealType] ?? 0;
                if ($taken >= $threshold) {
                    $mealTypes[] = $mealType;
                }
            }
            $days[] = ['meal_date' => $date->format('Y-m-d'), 'meal_types' => $mealTypes];
        }

        return $days;
    }

    /**
     * Select the row for update so two concurrent requests for the same cell
     * serialise rather than racing the unique constraint.
     */
    private function lockRow($memberId, string $mealDate, string $mealType): ?MealBooking
    {
        return MealBooking::query()
            ->where('member_id', $memberId)
            ->where('meal_date', $mealDate)
            ->where('meal_type', $mealType)
            ->lockForUpdate()
            ->first();
    }
}
