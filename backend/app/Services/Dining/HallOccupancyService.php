<?php

namespace App\Services\Dining;

use App\Models\Dining\MealToken;
use App\Repositories\Dining\MealSettingRepository;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * "How busy is the hall?" on the home screen.
 *
 * Card scans at the counter are the only real signal we have for footfall, so
 * occupancy is a histogram of meal_tokens.collected_at bucketed across the
 * meal's serving window. Buckets in the future are filled from a forecast --
 * the same weekday's average over recent weeks -- which is what the design
 * renders as the lighter bars.
 */
class HallOccupancyService
{
    private const BUCKET_MINUTES = 30;

    /** Weeks of history averaged into the forecast. */
    private const FORECAST_WEEKS = 4;

    private MealSettingRepository $settings;

    public function __construct(?MealSettingRepository $settings = null)
    {
        $this->settings = $settings ?: new MealSettingRepository();
    }

    /**
     * @return array{meal_type: ?string, level: string, wait_minutes: ?int, buckets: array}
     */
    public function forMeal(?string $mealType = null, $date = null): array
    {
        $date = Carbon::parse($date ?: now())->startOfDay();

        $requested = $mealType;
        $mealType = $mealType ?: $this->settings->getCurrentMeal($date->format('Y-m-d'))['meal_type'];

        /*
         * Between meals there is no live footfall, but "how busy is the hall?"
         * is still a useful question -- the member is deciding whether to go
         * later. Rather than showing nothing, preview the next meal's usual
         * pattern and mark the result as not live so the UI can say so.
         */
        $isLive = $mealType !== null;

        if (!$isLive && !$requested) {
            [$mealType, $date] = $this->nextServing($date);
        }

        if (!$mealType) {
            return $this->empty();
        }

        $setting = $this->settings->getEffectiveCost($mealType, $date->format('Y-m-d'));

        if (!$setting || empty($setting->start_time) || empty($setting->end_time)) {
            // Without a serving window there is nothing to bucket across.
            return $this->empty($mealType);
        }

        $windowStart = $date->copy()->setTimeFromTimeString($setting->start_time);
        $windowEnd   = $date->copy()->setTimeFromTimeString($setting->end_time);

        $actual   = $this->scanCounts($mealType, $windowStart, $windowEnd);
        $forecast = $this->forecastCounts($mealType, $date, $windowStart);

        $buckets = $this->buildBuckets($windowStart, $windowEnd, $actual, $forecast);

        $peak = max(1, max(array_map(fn ($b) => max($b['count'], $b['forecast']), $buckets)));

        // Normalise heights client-side against the busiest bucket so the chart
        // reads the same regardless of hall size.
        foreach ($buckets as $index => $bucket) {
            $value = $bucket['is_past'] || $bucket['is_now'] ? $bucket['count'] : $bucket['forecast'];
            $buckets[$index]['intensity'] = round($value / $peak, 3);
        }

        $current = collect($buckets)->firstWhere('is_now', true);
        $level   = $isLive ? $this->levelFor($current, $peak) : 'CLOSED';

        return [
            'meal_type'    => $mealType,
            'level'        => $level,
            // False when the hall is between meals and these bars are the usual
            // pattern for the next sitting rather than live scans.
            'is_live'      => $isLive,
            'meal_date'    => $date->format('Y-m-d'),
            'wait_minutes' => $isLive ? $this->waitFor($level, $current['count'] ?? 0) : null,
            'window_from'  => $setting->start_time,
            'window_to'    => $setting->end_time,
            'buckets'      => $buckets,
        ];
    }

    /**
     * The next meal due to be served. Delegates to the repository so the home
     * hero and this chart can never disagree about what is coming next.
     *
     * @return array{0: ?string, 1: Carbon} meal type and the date it is served on
     */
    private function nextServing(Carbon $date): array
    {
        $next = $this->settings->getNextServing($date);

        return $next
            ? [$next['meal_type'], Carbon::parse($next['meal_date'])->startOfDay()]
            : [null, $date];
    }

    /**
     * Scans already recorded today, per bucket.
     *
     * @return array<string, int> keyed "H:i" of the bucket start
     */
    private function scanCounts(string $mealType, Carbon $from, Carbon $to): array
    {
        return MealToken::query()
            ->where('meal_type', $mealType)
            ->whereBetween('collected_at', [$from, $to])
            ->get(['collected_at'])
            ->reduce(function (array $carry, $token) use ($from) {
                $key = $this->bucketKey($from, Carbon::parse($token->collected_at));
                $carry[$key] = ($carry[$key] ?? 0) + 1;

                return $carry;
            }, []) ?? [];
    }

    /**
     * The usual shape of this meal on this weekday, averaged over recent weeks.
     *
     * @return array<string, float>
     */
    private function forecastCounts(string $mealType, Carbon $date, Carbon $from): array
    {
        $dates = [];
        for ($week = 1; $week <= self::FORECAST_WEEKS; $week++) {
            $dates[] = $date->copy()->subWeeks($week)->format('Y-m-d');
        }

        $rows = MealToken::query()
            ->select('collected_at')
            ->where('meal_type', $mealType)
            ->whereNotNull('collected_at')
            ->whereIn(DB::raw('DATE(collected_at)'), $dates)
            ->get();

        $totals = [];
        foreach ($rows as $row) {
            $collected = Carbon::parse($row->collected_at);
            // Re-anchor the historic timestamp onto today's window so buckets align.
            $anchored = $from->copy()->setTime((int) $collected->format('H'), (int) $collected->format('i'));
            $key = $this->bucketKey($from, $anchored);
            $totals[$key] = ($totals[$key] ?? 0) + 1;
        }

        return array_map(fn ($total) => round($total / self::FORECAST_WEEKS, 1), $totals);
    }

    private function buildBuckets(Carbon $from, Carbon $to, array $actual, array $forecast): array
    {
        $buckets = [];
        $now     = now();

        for ($start = $from->copy(); $start->lt($to); $start->addMinutes(self::BUCKET_MINUTES)) {
            $end = $start->copy()->addMinutes(self::BUCKET_MINUTES);
            $key = $start->format('H:i');

            $buckets[] = [
                'label'    => $start->format('g:i'),
                'time'     => $key,
                'count'    => (int) ($actual[$key] ?? 0),
                'forecast' => (float) ($forecast[$key] ?? 0),
                'is_past'  => $end->lte($now),
                'is_now'   => $now->betweenIncluded($start, $end),
            ];
        }

        return $buckets;
    }

    private function bucketKey(Carbon $windowStart, Carbon $moment): string
    {
        $elapsed = $windowStart->diffInMinutes($moment, false);
        $index   = (int) floor(max(0, $elapsed) / self::BUCKET_MINUTES);

        return $windowStart->copy()->addMinutes($index * self::BUCKET_MINUTES)->format('H:i');
    }

    /**
     * Busyness relative to the day's own peak, so the wording stays meaningful
     * whether the hall serves 50 people or 500.
     */
    private function levelFor(?array $current, float $peak): string
    {
        if (!$current) {
            return 'CLOSED';
        }

        $ratio = $peak > 0 ? $current['count'] / $peak : 0;

        return match (true) {
            $ratio >= 0.75 => 'BUSY',
            $ratio >= 0.40 => 'MODERATE',
            default        => 'QUIET',
        };
    }

    /**
     * A rough queue estimate. Deliberately coarse and rounded to 5 minutes --
     * the design presents it as "~12 min", not a promise.
     */
    private function waitFor(string $level, int $scansThisBucket): ?int
    {
        if ($level === 'CLOSED') {
            return null;
        }

        $minutes = match ($level) {
            'BUSY'     => 10 + (int) floor($scansThisBucket / 10),
            'MODERATE' => 5,
            default    => 0,
        };

        return $minutes > 0 ? (int) (ceil($minutes / 5) * 5) : 0;
    }

    private function empty(?string $mealType = null): array
    {
        return [
            'meal_type'    => $mealType,
            'level'        => 'CLOSED',
            'is_live'      => false,
            'meal_date'    => now()->format('Y-m-d'),
            'wait_minutes' => null,
            'window_from'  => null,
            'window_to'    => null,
            'buckets'      => [],
        ];
    }
}
