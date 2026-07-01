<?php

namespace App\Repositories;

use App\Models\StockTransferItem;
use App\Services\ODataService;

class StockTransferItemRepository extends BaseRepository
{
    /**
     * @var StockTransferItem
     */
    protected $model;

    protected $request;

    protected $oDataService;

    protected $fieldSearchable = ['stock_transfer_id'];

    public function __construct()
    {
        $this->model         = new StockTransferItem();
    }
    protected function init()
    {
        $this->request      = request();
        $this->oDataService = (new ODataService())->init();
    }

    public function deleteStockTransferItemByIds($stockTransferId, $stockTransferItemIds)
    {
        return $this->newQuery()
            ->where('stock_transfer_id', $stockTransferId)
            ->whereNotIn('id', $stockTransferItemIds)
            ->delete();
    }
}
