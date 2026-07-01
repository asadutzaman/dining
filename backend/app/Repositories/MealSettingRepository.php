<?php

namespace App\Repositories;

use App\Models\MealSetting;
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
}
