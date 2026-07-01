<?php

namespace App\Repositories;

use App\Models\RequisitionItemLimit;
use App\Services\ODataService;

class RequisitionItemLimitRepository extends BaseRepository
{
    /**
     * @var RequisitionItemLimit
     */
    protected $model;

    protected $request;

    protected $oDataService;

    protected $fieldSearchable = ['designation_id', 'item_id', 'limit_type', 'effective_from'];

    public function __construct()
    {
        $this->model         = new RequisitionItemLimit();
    }
    protected function init()
    {
        $this->request      = request();
        $this->oDataService = (new ODataService())->init();
    }
}
