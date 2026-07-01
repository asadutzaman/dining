<?php

namespace App\Repositories;

use App\Models\DisbursementSlotAssign;
use App\Services\ODataService;

class DisbursementSlotAssignRepository extends BaseRepository
{
    /**
     * @var DisbursementSlotAssign
     */
    protected $model;

    protected $request;

    protected $oDataService;

    protected $fieldSearchable = ['title', 'description'];

    public function __construct()
    {
        $this->model         = new DisbursementSlotAssign();
    }
    protected function init()
    {
        $this->request      = request();
        $this->oDataService = (new ODataService())->init();
    }
}
