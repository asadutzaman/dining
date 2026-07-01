<?php

namespace App\Repositories;

use App\Models\StockAdjustment;
use App\Services\ODataService;

class StockAdjustmentRepository extends BaseRepository
{
    /**
     * @var StockAdjustment
     */
    protected $model;

    protected $request;

    protected $oDataService;

    protected $fieldSearchable = ['stock_adjustment_number', 'branch_id'];

    public function __construct()
    {
        $this->model         = new StockAdjustment();
    }
    protected function init()
    {
        $this->request      = request();
        $this->oDataService = (new ODataService())->init();
    }

    // CHECK STOCK ADJUSTMENT NUMBER UNIQUE
    public function checkStockAdjustmentNumberUnique($stockAdjustmentNumber, $id = null)
    {
        return $this->newQuery()
            ->where('stock_adjustment_number', $stockAdjustmentNumber)
            ->when((isset($id)), function ($query) use ($id) {
                return $query->whereNot('id', $id);
            })
            ->count();
    }
}
