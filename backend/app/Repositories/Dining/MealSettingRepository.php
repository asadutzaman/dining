<?php

namespace App\Repositories\Dining;

use App\Models\Dining\MealSetting;
use App\Repositories\BaseRepository;
use App\Services\ODataService;

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
