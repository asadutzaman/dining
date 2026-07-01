<?php

namespace App\Repositories;

use App\Models\DisbursementSlot;
use App\Services\ODataService;
use App\Repositories\BaseRepository;

class DisbursementSlotRepository extends BaseRepository
{
    /**
     * @var DisbursementSlot
     */
    protected $model;

    protected $request;

    protected $applicationSettingRepository;

    protected $oDataService;

    protected $fieldSearchable = ['date', 'start_time', 'end_time'];

    public function __construct()
    {
        $this->model         = new DisbursementSlot();
    }
    protected function init()
    {
        $this->request      = request();
        $this->oDataService = (new ODataService())->init();
    }
}
