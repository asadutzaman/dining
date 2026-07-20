<?php

namespace App\Console\Commands\Dining;

use App\Models\Dining\MealBooking;
use App\Models\Dining\Member;
use App\Repositories\Dining\MealSettingRepository;
use App\Services\Dining\MealBookingService;
use App\Services\Dining\MemberNotificationService;
use Carbon\Carbon;
use Illuminate\Console\Command;

/**
 * The two opt-in nudges from the profile screen:
 *
 *   cutoff   -- "45 minutes left to book or cancel today's dinner"
 *   reminder -- "Tomorrow has no bookings yet" (8:00 PM nightly)
 *
 * MemberNotificationService applies each member's preference, so this command
 * only decides who is *eligible* by state, not by preference.
 */
class SendBookingNudgesCommand extends Command
{
    protected $signature = 'dining:send-booking-nudges
                            {--type=all : cutoff, reminder or all}
                            {--lead=45 : Minutes before a cutoff to warn}';

    protected $description = 'Send cutoff warnings and empty-day booking reminders to members';

    public function handle(
        MealSettingRepository $settings,
        MemberNotificationService $notifications,
        MealBookingService $bookings
    ): int {
        $type = $this->option('type');

        if (in_array($type, ['all', 'cutoff'], true)) {
            $this->sendCutoffWarnings($settings, $notifications, (int) $this->option('lead'));
        }

        if (in_array($type, ['all', 'reminder'], true)) {
            $this->sendEmptyDayReminders($settings, $notifications, $bookings);
        }

        return self::SUCCESS;
    }

    /**
     * Warn about any meal whose cutoff falls inside the lead window. Sent to
     * everyone who could still act -- both those who have booked (they can still
     * cancel) and those who have not (they can still book).
     */
    private function sendCutoffWarnings(
        MealSettingRepository $settings,
        MemberNotificationService $notifications,
        int $leadMinutes
    ): void {
        $sent = 0;

        // Cutoffs can sit on the previous day, so both dates are in scope.
        foreach ([now()->startOfDay(), now()->startOfDay()->addDay()] as $mealDate) {
            foreach (MealBookingService::MEAL_TYPES as $mealType) {
                $setting = $settings->getEffectiveCost($mealType, $mealDate->format('Y-m-d'));
                if (!$setting) {
                    continue;
                }

                $cutoffAt = $setting->cutoffFor($mealDate);
                if (!$cutoffAt) {
                    continue;
                }

                // Only the single run that lands in the window fires, so members
                // are not warned repeatedly as the scheduler ticks.
                $minutesLeft = now()->diffInMinutes($cutoffAt, false);
                if ($minutesLeft < 0 || $minutesLeft > $leadMinutes) {
                    continue;
                }

                Member::query()
                    ->where('status', 1)
                    ->where('notify_cutoff_warning', true)
                    ->chunkById(500, function ($members) use ($notifications, $mealDate, $mealType, $cutoffAt, &$sent) {
                        foreach ($members as $member) {
                            if ($notifications->cutoffWarning($member, $mealDate, $mealType, $cutoffAt)) {
                                $sent++;
                            }
                        }
                    });
            }
        }

        $this->info("Cutoff warnings sent: {$sent}");
    }

    /**
     * Nightly prompt for members with nothing booked tomorrow.
     */
    private function sendEmptyDayReminders(
        MealSettingRepository $settings,
        MemberNotificationService $notifications,
        MealBookingService $bookings
    ): void {
        $tomorrow = now()->startOfDay()->addDay();

        // The earliest cutoff still ahead of us decides what the message says.
        $nextCutoff = collect(MealBookingService::MEAL_TYPES)
            ->map(fn ($mealType) => $settings->getEffectiveCost($mealType, $tomorrow->format('Y-m-d'))?->cutoffFor($tomorrow))
            ->filter(fn (?Carbon $cutoff) => $cutoff !== null && $cutoff->isFuture())
            ->sort()
            ->first();

        // One query for everyone who already has something booked, rather than a
        // per-member lookup inside the chunk loop.
        $alreadyBooked = MealBooking::query()
            ->where('meal_date', $tomorrow->format('Y-m-d'))
            ->where('booking_status', MealBooking::STATUS_BOOKED)
            ->distinct()
            ->pluck('member_id')
            ->flip();

        $sent = 0;

        Member::query()
            ->where('status', 1)
            ->where('notify_booking_reminder', true)
            ->chunkById(500, function ($members) use ($notifications, $tomorrow, $nextCutoff, $alreadyBooked, &$sent) {
                foreach ($members as $member) {
                    if ($alreadyBooked->has($member->id)) {
                        continue;
                    }

                    if ($notifications->bookingReminder($member, $tomorrow, $nextCutoff)) {
                        $sent++;
                    }
                }
            });

        $this->info("Empty-day reminders sent: {$sent}");
    }
}
