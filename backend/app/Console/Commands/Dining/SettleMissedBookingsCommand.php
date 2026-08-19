<?php

namespace App\Console\Commands\Dining;

use App\Models\Dining\MealBooking;
use App\Repositories\Dining\MealBookingRepository;
use App\Repositories\Dining\MealSettingRepository;
use App\Services\Dining\MealBookingService;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * Charges no-shows.
 *
 * A booking tells the kitchen to cook a meal. If the member never scanned and
 * the serving window has closed, that food was made for them, so the booking is
 * marked MISSED and charged -- the "Not scanned — still charged" row in the app.
 *
 * Runs nightly, but is safe to run at any time: it only touches bookings whose
 * serving window has demonstrably ended, and skips anything already settled.
 */
class SettleMissedBookingsCommand extends Command
{
    protected $signature = 'dining:settle-missed-bookings
                            {--date= : Settle up to this date instead of today}
                            {--dry-run : Report what would be charged without writing}';

    protected $description = 'Mark unscanned past bookings as missed and post their charges';

    public function handle(
        MealBookingRepository $bookings,
        MealSettingRepository $settings,
        MealBookingService $service
    ): int {
        $upTo = $this->option('date')
            ? Carbon::parse($this->option('date'))->startOfDay()
            : now()->startOfDay();

        $dryRun = (bool) $this->option('dry-run');

        $candidates = $bookings->unsettledBefore($upTo->format('Y-m-d'));

        $settled = 0;
        $charged = 0.0;
        $skipped = 0;

        foreach ($candidates as $booking) {
            if (!$this->windowHasClosed($booking, $settings)) {
                // Today's dinner is still being served -- not a no-show yet.
                $skipped++;
                continue;
            }

            if ($dryRun) {
                $this->line(sprintf(
                    '  would charge #%d  member=%d  %s %s  ৳%s',
                    $booking->id,
                    $booking->member_id,
                    $booking->meal_date->format('Y-m-d'),
                    $booking->meal_type,
                    number_format((float) $booking->unit_price, 2)
                ));
                $settled++;
                $charged += (float) $booking->unit_price;
                continue;
            }

            // Each booking in its own transaction: one bad row must not roll back
            // a whole night's settlement.
            try {
                DB::transaction(function () use ($service, $booking, &$charged) {
                    $service->markMissed($booking);
                    $charged += (float) $booking->charged_amount;
                });
                $settled++;
            } catch (\Throwable $e) {
                $this->error("  booking #{$booking->id} failed: {$e->getMessage()}");
            }
        }

        $this->info(sprintf(
            '%s %d booking(s) as missed, ৳%s charged. %d still within their serving window.',
            $dryRun ? '[dry run] Would mark' : 'Marked',
            $settled,
            number_format($charged, 2),
            $skipped
        ));

        return self::SUCCESS;
    }

    /**
     * A booking is only a no-show once its meal's serving window has ended. With
     * no window configured we fall back to end of day, which is the safest
     * interpretation -- it never charges someone whose meal might still be served.
     */
    private function windowHasClosed(MealBooking $booking, MealSettingRepository $settings): bool
    {
        $date    = $booking->meal_date;
        $setting = $settings->getEffectiveCost($booking->meal_type, $date->format('Y-m-d'));

        $endsAt = $setting && !empty($setting->end_time)
            ? $date->copy()->setTimeFromTimeString($setting->end_time)
            : $date->copy()->endOfDay();

        return now()->greaterThan($endsAt);
    }
}
