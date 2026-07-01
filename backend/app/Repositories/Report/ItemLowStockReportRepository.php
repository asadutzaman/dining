<?php

namespace App\Repositories\Report;

use App\Services\ODataService;
use App\Repositories\BaseRepository;
use App\Models\ItemLowStockReport;
use App\Repositories\ItemRepository;
use App\Repositories\ItemStockRepository;
use Illuminate\Support\Facades\Log;
use App\Http\Resources\Report\ItemLowStockReportResource;
use App\Repositories\RequisitionItemRepository;
use App\Repositories\RequisitionRepository;
use Illuminate\Support\Facades\DB;

class ItemLowStockReportRepository extends BaseRepository
{
    /**
     * @var ItemLowStockReport
     */

    protected $request;
    protected $reportQuery;

    public function init()
    {
        $this->request      = request();
        $this->oDataService = (new ODataService())->init();
        return $this;
    }

    public function getItemLowStock()
    {
        $oDataParams = $this->oDataService->getFilterQueryParams();

        $results = [
            'meta' => [],
            'results' => [],
        ];

        if (!empty($oDataParams['branch_id'])) {
            $lowItemIds = (new ItemStockRepository())
                ->newQuery()
                ->where('branch_id', $oDataParams['branch_id'])
                ->when(!empty($oDataParams['item_ids']), function ($query) use ($oDataParams) {
                    $query->whereIn('item_id', $oDataParams['item_ids']);
                })
                ->select('item_id')
                ->selectRaw('SUM(balance_quantity) as balance_qty_sum')
                ->groupBy('item_id')
                ->with(['itemInfo' => function ($q) {
                    $q->select('id', 'reorder_qty');
                }])
                ->get()
                ->filter(function ($item) {
                    return $item->itemInfo && (float)$item->balance_qty_sum < (float)$item->itemInfo->reorder_qty;
                })
                ->pluck('item_id');

            $reportQuery = (new ItemStockRepository())
                ->newQuery()
                ->select('id', 'branch_id', 'item_id', 'shelve_id', 'balance_quantity', 'action_from')
                ->with([
                    'branchInfo:id,name',
                    'itemInfo:id,name_en,name_bn,code,logistic_id,reorder_qty',
                    'itemInfo.logisticInfo:id,name,code',
                    'shelveInfo:id,name',
                ])
                ->where('branch_id', $oDataParams['branch_id'])
                ->whereIn('item_id', $lowItemIds);

            $results = $this->applyPaginate($reportQuery);
        }
        $responseData = [
            'meta' => $results['meta'],
            'results' => $results['results'],
        ];
        return $responseData;
    }

    public function getDemandVsStock($branchId = null)
    {
        $oDataParams = $this->oDataService->getFilterQueryParams();
        $branchId = $oDataParams['branch_id'] ?? $branchId;
        $prefix = DB::connection()->getTablePrefix() ?? '';

        $results = [
            'meta' => [],
            'results' => [],
        ];
        if ($branchId) {
            // 🔹 Stock Subquery
            $stockSubQuery = DB::table('item_stocks')
                ->select('item_id', DB::raw('SUM(balance_quantity) as total_stock'))
                ->where('branch_id', $branchId)
                ->whereNull('deleted_at')
                ->groupBy('item_id');
            // ->get();

            // 🔹 Demand Subquery
            $demandSubQuery = DB::table('requisition_items')
                ->join('requisitions', 'requisitions.id', '=', 'requisition_items.requisition_id')
                ->whereNotIn('requisitions.process_status', ['DRAFT', 'APPROVED'])
                ->whereNull('requisitions.deleted_at')
                ->whereNull('requisition_items.deleted_at')
                ->select('requisition_items.item_id', DB::raw("SUM({$prefix}requisition_items.request_quantity) as total_demand"))
                ->groupBy('requisition_items.item_id');
            // ->get();

            // 🔹 Main Query
            $query = (new ItemRepository())->newQuery()
                ->leftJoinSub($stockSubQuery, 'stocks', 'items.id', '=', 'stocks.item_id')
                ->joinSub($demandSubQuery, 'demands', 'items.id', '=', 'demands.item_id')
                ->leftJoin('logistics', 'items.logistic_id', '=', 'logistics.id')
                ->select(
                    'items.id as item_id',
                    'items.name_en',
                    'items.code',
                    'items.logistic_id',
                    'logistics.name as logistic_name',
                    'items.reorder_qty',
                    DB::raw("COALESCE({$prefix}stocks.total_stock, 0) as stock_qty"),
                    DB::raw("COALESCE({$prefix}demands.total_demand, 0) as demand_qty"),
                    DB::raw("(COALESCE({$prefix}demands.total_demand, 0) - COALESCE({$prefix}stocks.total_stock, 0)) as gap_qty"),
                    DB::raw("
                    CASE WHEN (COALESCE({$prefix}demands.total_demand, 0) - COALESCE({$prefix}stocks.total_stock, 0)) <= 0 THEN 'Safe'
                    WHEN (COALESCE({$prefix}demands.total_demand, 0) - COALESCE({$prefix}stocks.total_stock, 0)) >= {$prefix}items.reorder_qty THEN 'Critical' ELSE 'Low' END as stock_status
                    ")
                )
                ->when(!empty($oDataParams['stock_status']), function ($query) use ($prefix, $oDataParams) {
                    if ($oDataParams['stock_status'] == 'EMPTY_STOCK') {
                        $query->whereRaw(DB::raw("COALESCE({$prefix}stocks.total_stock, 0) = 0"));
                    } else if ($oDataParams['stock_status'] == 'DEMAND_GT_STOCK') {
                        $query->whereRaw(DB::raw("COALESCE({$prefix}demands.total_demand, 0) > COALESCE({$prefix}stocks.total_stock, 0)"));
                    } else if ($oDataParams['stock_status'] == 'LOW_STOCK') {
                        $query->whereRaw(DB::raw("COALESCE({$prefix}stocks.total_stock, 0) > 0"))
                            ->whereRaw(DB::raw("COALESCE({$prefix}stocks.total_stock, 0) < COALESCE({$prefix}items.reorder_qty, 0)"));
                    }
                });

            $results = $this->applyPaginate($query);
        }
        $responseData = [
            'meta' => $results['meta'],
            'results' => $results['results'],
        ];
        return $responseData;
    }

    public function getItemLowStockExport()
    {
        $oDataParams = $this->oDataService->getFilterQueryParams();

        $results = [
            // 'meta' => [],
            'results' => [],
        ];

        if (!empty($oDataParams['branch_id'])) {
            $lowItemIds = (new ItemStockRepository())
                ->newQuery()
                ->where('branch_id', $oDataParams['branch_id'])
                ->when(!empty($oDataParams['item_ids']), function ($query) use ($oDataParams) {
                    $query->whereIn('item_id', $oDataParams['item_ids']);
                })
                ->select('item_id')
                ->selectRaw('SUM(balance_quantity) as balance_qty_sum')
                ->groupBy('item_id')
                ->with(['itemInfo' => function ($q) {
                    $q->select('id', 'reorder_qty');
                }])
                ->get()
                ->filter(function ($item) {
                    return $item->itemInfo && (float)$item->balance_qty_sum < (float)$item->itemInfo->reorder_qty;
                })
                ->pluck('item_id');

            $reportQuery = (new ItemStockRepository())
                ->newQuery()
                ->select('id', 'branch_id', 'item_id', 'shelve_id', 'balance_quantity', 'action_from')
                ->with([
                    'branchInfo:id,name',
                    'itemInfo:id,name_en,name_bn,code,logistic_id,reorder_qty',
                    'itemInfo.logisticInfo:id,name,code',
                    'shelveInfo:id,name',
                ])
                ->where('branch_id', $oDataParams['branch_id'])
                ->whereIn('item_id', $lowItemIds);

            // $results = $this->applyPaginate($reportQuery);

            $results = [
                // 'meta' => [],
                'results' => $reportQuery->get(),
            ];
        }
        $responseData = [
            // 'meta' => $results['meta'],
            'results' => $results['results'],
        ];
        return $responseData;
    }
}
