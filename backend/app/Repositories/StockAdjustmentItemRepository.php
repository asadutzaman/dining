<?php

namespace App\Repositories;

use App\Models\StockAdjustmentItem;
use App\Services\ODataService;

class StockAdjustmentItemRepository extends BaseRepository
{
    /**
     * @var StockAdjustmentItem
     */
    protected $model;

    protected $request;

    protected $oDataService;

    protected $fieldSearchable = ['stock_adjustment_id'];

    public function __construct()
    {
        $this->model         = new StockAdjustmentItem();
    }
    protected function init()
    {
        $this->request      = request();
        $this->oDataService = (new ODataService())->init();
    }
}
