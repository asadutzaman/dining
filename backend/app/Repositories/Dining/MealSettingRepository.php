<?php

namespace App\Repositories\Dining;

use App\Models\Dining\MealSetting;
use App\Repositories\BaseRepository;
use App\Services\ODataService;
use Carbon\Carbon;

class MealSettingRepository extends BaseRepository
{
    /**
    * @var MealSetting
    */
    protected $model;

    protected $request;

    protected $oDataService;

    protected $fieldSearchable = ['meal_type'];

    public function __construct()
    {
        $this->model = new MealSetting();
    }

    protected function init()
    {
        $this->request      = request();
        $this->oDataService = (new ODataService())->init();
    }

    public function checkEffectiveFromUnique($mealType, $effectiveFrom, $id = null)
    {
        return $this->newQuery()
            ->where('meal_type', $mealType)
            ->where('effective_from', $effectiveFrom)
            ->when((isset($id)), function ($query) use ($id) {
                return $query->whereNot('id', $id);
            })
            ->count();
    }

    // Latest active cost for a meal type as of (or before) the given date
    public function getEffectiveCost($mealType, $date)
    {
        return $this->newQuery()
            ->where('meal_type', $mealType)
            ->where('effective_from', '<=', $date)
            ->where('status', 1)
            ->orderBy('effective_from', 'desc')
            ->first();
    }

    /**
     * The next sitting due to start: the rest of today, otherwise tomorrow's
     * earliest. Used wherever the UI has to stay useful between meals -- the
     * home hero and the occupancy chart both need something to show when
     * nothing is being served.
     *
     * @return array{meal_type: string, meal_date: string, starts_at: Carbon, setting: MealSetting}|null
     */
    public function getNextServing($date = null): ?array
    {
        $date = Carbon::parse($date ?: now())->startOfDay();
        $now  = now();

        foreach ([$date, $date->copy()->addDay()] as $day) {
            $slots = [];

            foreach (['BREAKFAST', 'LUNCH', 'DINNER'] as $mealType) {
                $setting = $this->getEffectiveCost($mealType, $day->format('Y-m-d'));

                if (!$setting || empty($setting->start_time)) {
                    continue;
                }

                $startsAt = $day->copy()->setTimeFromTimeString($setting->start_time);

                // Today's already-started sittings are behind us.
                if ($day->isSameDay($date) && $startsAt->lessThanOrEqualTo($now)) {
                    continue;
                }

                $slots[] = [
                    'meal_type' => $mealType,
                    'meal_date' => $day->format('Y-m-d'),
                    'starts_at' => $startsAt,
                    'setting'   => $setting,
                ];
            }

            if (!empty($slots)) {
                usort($slots, fn ($a, $b) => $a['starts_at'] <=> $b['starts_at']);

                return $slots[0];
            }
        }

        return null;
    }

    /**
     * Determine which meal is being served right now based on each meal's
     * effective time window. Returns:
     *   meal_type: the active meal now (or null if none / windows not configured)
     *   cost: that meal's cost
     *   windows_configured: whether ANY effective meal has a time window set
     *
     * "windows_configured = false" means no meal restricts by time, so the
     * Issue screen falls back to a manual meal picker (no time restriction).
     */
    public function getCurrentMeal($date = null, $now = null)
    {
        $date = $date ?: now()->format('Y-m-d');
        $now = $now ?: now()->format('H:i:s');

        $windowsConfigured = false;
        $currentMeal = null;
        $currentCost = null;

        foreach (['BREAKFAST', 'LUNCH', 'DINNER'] as $mealType) {
            $setting = $this->getEffectiveCost($mealType, $date);
            if (!$setting) {
                continue;
            }
            if (!empty($setting->start_time) && !empty($setting->end_time)) {
                $windowsConfigured = true;
                if ($now >= $setting->start_time && $now <= $setting->end_time && $currentMeal === null) {
                    $currentMeal = $mealType;
                    $currentCost = $setting->cost;
                }
            }
        }

        return [
            'meal_type'          => $currentMeal,
            'cost'               => $currentCost,
            'windows_configured' => $windowsConfigured,
        ];
    }
}
