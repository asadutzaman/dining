<?php

namespace App\Repositories;

use App\Models\ItemStockOutHistories;
use App\Services\ODataService;

class ItemStockOutHistoryRepository extends BaseRepository
{
    /**
     * @var ItemStockOutHistories
     */
    protected $model;

    protected $request;

    protected $oDataService;

    protected $fieldSearchable = ['item_id'];

    public function __construct()
    {
        $this->model         = new ItemStockOutHistories();
    }
    protected function init()
    {
        $this->request      = request();
        $this->oDataService = (new ODataService())->init();
    }
}
