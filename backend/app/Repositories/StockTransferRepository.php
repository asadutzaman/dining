<?php

namespace App\Repositories;

use App\Models\StockTransfer;
use App\Services\ODataService;

class StockTransferRepository extends BaseRepository
{
    /**
     * @var StockTransfer
     */
    protected $model;

    protected $request;

    protected $oDataService;

    protected $fieldSearchable = ['stock_transfer_number', 'process_status'];

    public function __construct()
    {
        $this->model         = new StockTransfer();
    }
    protected function init()
    {
        $this->request      = request();
        $this->oDataService = (new ODataService())->init();
    }

    // CHECK STOCK_TRANSFER NUMBER UNIQUE
    public function checkStockTransferNumberUnique($stockTransferNumber, $id = null)
    {
        return $this->newQuery()
            ->where('stock_transfer_number', $stockTransferNumber)
            ->when((isset($id)), function ($query) use ($id) {
                return $query->whereNot('id', $id);
            })
            ->count();
    }
}
