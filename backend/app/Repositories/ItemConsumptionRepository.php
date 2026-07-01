<?php

namespace App\Repositories;

use App\Models\ItemConsumption;
use App\Services\ODataService;

class ItemConsumptionRepository extends BaseRepository
{
    /**
     * @var ItemConsumption
     */
    protected $model;

    protected $request;

    protected $oDataService;

    protected $fieldSearchable = ['item_id', 'remarks'];

    public function __construct()
    {
        $this->model         = new ItemConsumption();
    }
    protected function init()
    {
        $this->request      = request();
        $this->oDataService = (new ODataService())->init();
    }
}
