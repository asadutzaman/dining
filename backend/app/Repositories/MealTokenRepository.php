<?php

namespace App\Repositories;

use App\Models\MealToken;
use App\Services\ODataService;

class MealTokenRepository extends BaseRepository
{
    /**
    * @var MealToken
    */
    protected $model;

    protected $request;

    protected $oDataService;

    protected $fieldSearchable = ['token_number'];

    public function __construct()
    {
        $this->model = new MealToken();
    }

    protected function init()
    {
        $this->request      = request();
        $this->oDataService = (new ODataService())->init();
    }

    public function checkAlreadyIssued($memberId, $mealType, $mealDate)
    {
        return $this->newQuery()
            ->where('member_id', $memberId)
            ->where('meal_type', $mealType)
            ->where('meal_date', $mealDate)
            ->count();
    }

    public function findByTokenNumber($tokenNumber)
    {
        return $this->newQuery()
            ->where('token_number', $tokenNumber)
            ->first();
    }
}
