<?php

namespace App\Repositories;

use App\Models\ItemStock;
use App\Services\ODataService;

class ItemStockRepository extends BaseRepository
{
    /**
     * @var ItemStock
     */
    protected $model;

    protected $request;

    protected $oDataService;

    protected $fieldSearchable = ['branch_id', 'item_id'];

    public function __construct()
    {
        $this->model         = new ItemStock();
    }
    protected function init()
    {
        $this->request      = request();
        $this->oDataService = (new ODataService())->init();
    }

    public function getItemWiseAvailableStockQty($branchId, $itemId)
    {
        return $this->newQuery()
            ->where('branch_id', $branchId)
            ->where('item_id', $itemId)
            ->sum('balance_quantity') ?? 0;
    }

    public function getItemWiseStockList($stockOutLogic = 'FIFO', $branchId, $itemId, $requestTransferQty)
    {
        $query = $this->newQuery()
            ->where('branch_id', $branchId)
            ->where('item_id', $itemId)
            ->where('balance_quantity', '>', 0)
            ->when((isset($stockOutLogic)), function ($query) use ($stockOutLogic) {
                if ($stockOutLogic == 'FIFO') {
                    return $query->orderBy('id', 'asc');
                } elseif ($stockOutLogic == 'LIFO') {
                    return $query->orderBy('id', 'desc');
                }
            });

        $items = [];
        $totalQty = 0;

        // Using cursor for memory-efficient record processing
        foreach ($query->cursor() as $item) {
            $items[] = $item;
            $totalQty += $item->balance_quantity;

            // Stop adding items if we've reached or exceeded the requestTransferQty
            if ($totalQty >= $requestTransferQty) {
                break;
            }
        }
        return $items;
    }

    public function getItemStockByBranch($branchId)
    {
        $branchItemIds = $this->newQuery()
            ->where('branch_id', $branchId)
            ->get()
            ->pluck('item_id')
            ->unique();

        $branchItemStocks = $this->newQuery()
            ->where('branch_id', $branchId)
            ->whereIn('item_id', $branchItemIds)
            ->where('balance_quantity', '>', 0)
            ->select('item_id')
            ->selectRaw('SUM(balance_quantity) as balance_quantity')
            ->groupBy('item_id')
            ->get();

        return $branchItemStocks;
    }

    /**
     * Count the number of distinct items that are currently not stocked.  We
     * derive this from the item repository because the concept crosses
     * both tables, but the logic is simple: take the total item count and
     * subtract the number of items that have a positive balance_quantity in
     * *any* stock record.
     *
     * This is an alternative implementation to the join-based query in
     * `ItemRepository::countItemsWithoutStock`, and it avoids aggregating
     * on the potentially large `items` table when the number of stocked
     * items is much smaller.
     *
     * @return int
     */
    public function countItemsNotInStock()
    {
        // total number of items
        $totalItems = (new ItemRepository())->newQuery()->count();

        // items that currently have some positive balance
        $stockedItemCount = $this->newQuery()
            ->where('balance_quantity', '>', 0)
            ->distinct()
            ->count('item_id');

        return max(0, $totalItems - $stockedItemCount);
    }
}
