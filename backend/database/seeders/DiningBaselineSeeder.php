<?php

namespace Database\Seeders;

use App\Models\Dining\MealSetting;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

/**
 * The minimum dining configuration a FRESH install needs in order to work at all.
 *
 * Nothing else in the codebase writes `meal_settings`: DatabaseSeeder calls only AuthSeeder,
 * and the one seeder that does touch the table -- DiningSeeder -- truncates members, tokens
 * and payments and fills them with faker data, so it can never run on a real machine. Without
 * this seeder a fresh install comes up with no rate for any meal, every scan is refused with
 * "No active cost setting found for this meal type!", and the counter self-test reports
 * [FAIL] on all three meals.
 *
 * Deliberately unlike the other seeders in this directory:
 *   - it truncates NOTHING, so it is safe to re-run;
 *   - it is keyed on (meal_type, effective_from), matching the table's unique constraint, so a
 *     second run is a no-op rather than a duplicate-key error;
 *   - it never touches members, tokens, payments or balances.
 *
 * It is NOT part of DatabaseSeeder. The installer calls it explicitly, and only on the
 * fresh-install branch -- a machine restored from a production dump already has real rate
 * history and must not have today's placeholder prices layered on top.
 *
 * The values below are a working starting point, not a decision: the windows are contiguous so
 * that some meal is always being served (a gap reads as "between sittings" and refuses tokens),
 * and the price is uniform. Whoever sets the machine up is expected to correct both on day one
 * from Settings -> Meal Settings, which writes a new effective-dated row and leaves this one as
 * history.
 */
class DiningBaselineSeeder extends Seeder
{
    /**
     * meal type, cost, window start, window end, booking cutoff day offset, booking cutoff time.
     *
     * Cutoffs follow the convention documented on the meal_settings cutoff migration: breakfast
     * closes the previous evening, lunch and dinner close earlier the same day.
     */
    private array $meals = [
        ['BREAKFAST', 60.00, '00:00:00', '11:00:00', -1, '21:00:00'],
        ['LUNCH',     60.00, '11:00:00', '16:00:00',  0, '10:00:00'],
        ['DINNER',    60.00, '16:00:00', '23:55:00',  0, '15:00:00'],
    ];

    public function run()
    {
        $effectiveFrom = Carbon::today()->toDateString();

        foreach ($this->meals as [$type, $cost, $start, $end, $cutoffOffset, $cutoffTime]) {
            $setting = MealSetting::withTrashed()->firstOrNew([
                'meal_type'      => $type,
                'effective_from' => $effectiveFrom,
            ]);

            // An existing row for today was put there by a person; leave their numbers alone.
            if ($setting->exists) {
                $this->command?->info("meal_settings: {$type} already configured for {$effectiveFrom}, left as is.");
                continue;
            }

            $setting->fill([
                'cost'              => $cost,
                'start_time'        => $start,
                'end_time'          => $end,
                'cutoff_day_offset' => $cutoffOffset,
                'cutoff_time'       => $cutoffTime,
                'status'            => 1,
            ])->save();

            $this->command?->info("meal_settings: seeded {$type} at {$cost} ({$start}-{$end}).");
        }
    }
}
