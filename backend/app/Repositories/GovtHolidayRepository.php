<?php

namespace App\Repositories;

use App\Models\GovtHoliday;
use App\Services\ODataService;



class GovtHolidayRepository extends BaseRepository
{
    /**
     * @var GovtHoliday
     */
    protected $model;

    protected $request;

    protected $oDataService;

    protected $fieldSearchable = ['day', 'month', 'year', 'holiday_type'];

    public function __construct()
    {
        $this->model         = new GovtHoliday();
    }
    protected function init()
    {
        $this->request      = request();
        $this->oDataService = (new ODataService())->init();
    }
}
