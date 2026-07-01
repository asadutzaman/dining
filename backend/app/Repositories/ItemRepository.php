<?php

namespace App\Repositories;

use App\Models\Item;
use Illuminate\Support\Str;
use App\Services\ODataService;

class ItemRepository extends BaseRepository
{
    /**
     * @var Item
     */
    protected $model;

    protected $request;

    protected $oDataService;

    protected $fieldSearchable = ['type', 'name_en', 'name_bn', 'code', 'description'];

    public function __construct()
    {
        $this->model         = new Item();
    }
    protected function init()
    {
        $this->request      = request();
        $this->oDataService = (new ODataService())->init();
    }

    // GENERATE ITEM CODE WITH LOGISTIC CODE
    public function getItemCodeByLogistic($logisticId)
    {
        $logisticRepository = new LogisticRepository();
        $logisticInfo = $logisticRepository->findById($logisticId);

        // LOGISTIC CODE WISE LAST ITEM CODE
        $latestItemInfo = $this->newQuery()
            ->where('logistic_id', $logisticId)
            ->orderBy('code', 'desc')
            ->first();

        // GENERATE ITEM CODE
        $autoIncrementNumber = 1;
        if (!empty($latestItemInfo)) {
            $productCodeArray = explode('-', $latestItemInfo->code, 2);

            $autoIncrementNumber = intval($productCodeArray[1]) + 1;
        }

        $paddedString = str_pad($autoIncrementNumber, 4, '0', STR_PAD_LEFT);

        return "{$logisticInfo->code}-{$paddedString}";
    }

    public function checkItemCodeUnique($code)
    {
        return $this->newQuery()
            ->where('code', $code)
            ->count();
    }

    public function checkItemNameCodeUnique($nameEn, $id = null)
    {
        $nameCode = Str::lower(Str::squish($nameEn));
        return $this->newQuery()
            ->where('name_en', $nameCode)
            ->when((isset($id)), function ($query) use ($id) {
                return $query->whereNot('id', $id);
            })
            ->count();
    }

    // CHECK ITEM EXIST IN THIS LOGISTICS
    public function checkItemExistInLogistics($itemId, $logisticId)
    {
        return $this->newQuery()
            ->where('id', $itemId)
            ->where('logistic_id', $logisticId)
            ->count() > 0 ? true : false;
    }

    // CHECK ITEM UNIQUE
    public function checkItemUnique($logisticId, $itemCategoryId, $brandId, $unitId, $name, $id = null)
    {
        return $this->newQuery()
            ->when((isset($id)), function ($query) use ($id) {
                return $query->whereNot('id', $id);
            })
            ->where('logistic_id', $logisticId)
            ->where('item_category_id', $itemCategoryId)
            ->where('brand_id', $brandId)
            ->where('base_unit_id', $unitId)
            ->where('name_en', $name)
            ->count();
    }

    /**
     * Count the number of items that have no available stock.  This
     * includes items that never have a row in `item_stocks` as well as
     * those whose records all have a zero balance_quantity.
     *
     * @return int
     */
    public function countItemsWithoutStock()
    {
        return $this->newQuery()
            ->leftJoin('item_stocks', 'items.id', '=', 'item_stocks.item_id')
            ->selectRaw('items.id, COALESCE(SUM(item_stocks.balance_quantity),0) as total_balance')
            ->groupBy('items.id')
            ->havingRaw('COALESCE(SUM(item_stocks.balance_quantity),0) = 0')
            ->count();
    }
}
