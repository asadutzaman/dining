<?php

namespace App\Repositories\Report;

use App\Repositories\LogisticRepository;
use App\Services\ODataService;
use App\Repositories\BaseRepository;
use App\Repositories\ItemStockRepository;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use App\Models\Item;
use App\Models\GoodsReceiveNoteItem;
use App\Models\RequisitionItem;
use App\Repositories\BranchRepository;
use App\Repositories\ItemRepository;
use App\Repositories\RequisitionItemRepository;
use Helper;
use Illuminate\Support\Facades\Log;

class ItemStockReportRepository extends BaseRepository
{
    protected $request;
    protected $reportQuery;

    public function init()
    {
        $this->request      = request();
        $this->oDataService = (new ODataService())->init();
        return $this;
    }

    public function getItemStockList()
    {
        $oDataParams = $this->oDataService->getFilterQueryParams();

        if (!empty($oDataParams['branch_id'])) {
            $reportQuery = (new ItemStockRepository())
                ->newQuery()
                ->select('id', 'branch_id', 'item_id', 'shelve_id', 'balance_quantity', 'action_from', 'created_at')
                ->with([
                    'branchInfo:id,name',
                    'itemInfo:id,name_en,name_bn,code,logistic_id,reorder_qty',
                    'itemInfo.logisticInfo:id,name,code',
                    'shelveInfo:id,name',
                ])
                ->whereHas('itemInfo', function ($query) use ($oDataParams) {
                    if (!empty($oDataParams['logistic_id'])) {
                        $query->where('logistic_id', $oDataParams['logistic_id']);
                    }
                })
                ->where('branch_id', $oDataParams['branch_id'])
                ->where('balance_quantity', '>', 0)
                ->when(!empty($oDataParams['item_ids']), function ($query) use ($oDataParams) {
                    $query->whereIn('item_id', $oDataParams['item_ids']);
                })
                ->orderBy('balance_quantity', 'asc');
            $results = $this->applyPaginate($reportQuery);
        } else {
            $results = [
                'meta' => [],
                'results' => [],
            ];
        }

        $responseData = [
            'meta' => $results['meta'],
            'results' => $results['results'],
        ];
        return $responseData;
    }

    public function getItemStockListExport()
    {
        $oDataParams = $this->oDataService->getFilterQueryParams();
        $logisticId = $oDataParams['logistic_id'] ?? null;
        $searchItemIds = $oDataParams['item_ids'] ?? [];
        $stockLevel = $oDataParams['stock_level'] ?? null;
        $financialYear = $oDataParams['financial_year'] ?? null; // "2026-2027"
        // $helper = new Helper;
        $dateRange = $this->getFiscalYearRange($financialYear); // if null then it take running financial year
        // $startDate = substr($dateRange['start_date'], 0, 10);
        // $endDate = substr($dateRange['end_date'], 0, 10);
        $prefix = DB::connection()->getTablePrefix() ?? '';

        if ($logisticId && $logisticId !== 'ALL') {
            $logisticInfo = (new LogisticRepository())->findById($logisticId);
            $logisticName = $logisticInfo->name ?? '';
        } else {
            $logisticId = null;
            $logisticName = 'All Logistics';
        }

        $warehouseInfo = (new BranchRepository())->getWarehouseInfo();
        if (empty($warehouseInfo)) {
            return [
                'meta' => [],
                'results' => [],
                'logistic_name' => $logisticName,
            ];
        }
        $warehouseId = $warehouseInfo->id ?? null; // Default warehouse branch

        if (!empty($warehouseId)) {
            // Subquery for GRN Stats
            $grnStats = (new ItemStockRepository())
                ->newQuery()
                ->select(
                    'item_stocks.item_id',
                    DB::raw("SUM({$prefix}item_stocks.quantity) as total_grn_qty"),
                    DB::raw("SUM({$prefix}item_stocks.balance_quantity) as current_stock"),
                    DB::raw("MAX({$prefix}item_stocks.created_at) as last_grn_date")
                )
                ->where('item_stocks.branch_id', $warehouseId)
                ->whereBetween('item_stocks.created_at', [$dateRange['start_date'], $dateRange['end_date']])
                ->when(!empty($logisticId), function ($query) use ($logisticId) {
                    $query->whereHas('itemInfo', function ($q) use ($logisticId) {
                        $q->where('logistic_id', $logisticId);
                    });
                })
                ->when(!empty($searchItemIds), function ($query) use ($searchItemIds) {
                    $query->whereIn('item_stocks.item_id', $searchItemIds);
                })
                ->groupBy('item_stocks.item_id');

            // Subquery for Disbursed Stats
            $disbursedStats = (new ItemStockRepository())
                ->newQuery()
                ->select(
                    'item_stocks.item_id',
                    DB::raw("SUM({$prefix}item_stocks.quantity) as total_disburse_qty"),
                    DB::raw("MAX({$prefix}item_stocks.created_at) as last_disburse_date")
                )
                ->whereNot('item_stocks.branch_id', $warehouseId)
                ->whereBetween('item_stocks.created_at', [$dateRange['start_date'], $dateRange['end_date']])
                ->when(!empty($logisticId), function ($query) use ($logisticId) {
                    $query->whereHas('itemInfo', function ($q) use ($logisticId) {
                        $q->where('logistic_id', $logisticId);
                    });
                })
                ->when(!empty($searchItemIds), function ($query) use ($searchItemIds) {
                    $query->whereIn('item_stocks.item_id', $searchItemIds);
                })
                ->whereIn('item_stocks.action_from', ['Material_Requisition', 'Stock_Transfer'])
                ->groupBy('item_stocks.item_id');

            // Subquery for Running Demand
            $runningDemandStats = (new RequisitionItemRepository())
                ->newQuery()
                ->select(
                    'requisition_items.item_id',
                    DB::raw("SUM({$prefix}requisition_items.request_quantity) as running_demand")
                )
                ->join('requisitions', 'requisition_items.requisition_id', '=', 'requisitions.id')
                // ->where('requisitions.branch_id', $warehouseId)
                ->when(!empty($searchItemIds), function ($query) use ($searchItemIds) {
                    $query->whereIn('requisition_items.item_id', $searchItemIds);
                })
                ->whereNotIn('requisitions.process_status', ['DISBURSED', 'ACKNOWLEDGED', 'REJECTED'])
                ->whereBetween('requisitions.created_at', [$dateRange['start_date'], $dateRange['end_date']])
                ->groupBy('requisition_items.item_id');

            // Main Query
            $reportQuery = (new ItemRepository())
                ->newQuery()
                ->select(
                    'items.id',
                    'items.code',
                    'items.name_en',
                    'items.name_bn',
                    'item_categories.name as category_name',
                    'units.short_name as unit_name',
                    DB::raw("COALESCE({$prefix}grn_stats.total_grn_qty, 0) as total_grn_qty"),
                    DB::raw("COALESCE({$prefix}disbursed_stats.total_disburse_qty, 0) as total_disburse_qty"),
                    DB::raw("COALESCE({$prefix}grn_stats.current_stock, 0) as current_stock"),
                    DB::raw("COALESCE({$prefix}running_demand_stats.running_demand, 0) as running_demand"),
                    DB::raw("(COALESCE({$prefix}grn_stats.current_stock, 0) - COALESCE({$prefix}running_demand_stats.running_demand, 0)) as demand_stock_gap"),
                    DB::raw("CASE WHEN (COALESCE({$prefix}grn_stats.current_stock, 0) - COALESCE({$prefix}running_demand_stats.running_demand, 0)) < 0 THEN 'Risk' ELSE 'Safe' END as risk_status"),
                    DB::raw("{$prefix}grn_stats.last_grn_date"),
                    DB::raw("{$prefix}disbursed_stats.last_disburse_date")
                )
                ->leftJoin('item_categories', 'items.item_category_id', '=', 'item_categories.id')
                ->leftJoin('units', 'items.base_unit_id', '=', 'units.id')
                ->leftJoinSub($grnStats, 'grn_stats', function ($join) {
                    $join->on('items.id', '=', 'grn_stats.item_id');
                })
                ->leftJoinSub($disbursedStats, 'disbursed_stats', function ($join) {
                    $join->on('items.id', '=', 'disbursed_stats.item_id');
                })
                ->leftJoinSub($runningDemandStats, 'running_demand_stats', function ($join) {
                    $join->on('items.id', '=', 'running_demand_stats.item_id');
                })
                ->when(!empty($logisticId), function ($query) use ($logisticId) {
                    $query->where('items.logistic_id', $logisticId);
                })
                ->when(!empty($searchItemIds), function ($query) use ($searchItemIds) {
                    $query->whereIn('items.id', $searchItemIds);
                })
                ->when(!empty($stockLevel), function ($query) use ($stockLevel, $prefix) {
                    if ($stockLevel === 'SAFE') {
                        $query->whereRaw("COALESCE({$prefix}grn_stats.current_stock, 0) > COALESCE({$prefix}running_demand_stats.running_demand, 0)");
                    } else if ($stockLevel === 'DEMAND_GT_STOCK') {
                        $query->whereRaw("COALESCE({$prefix}running_demand_stats.running_demand, 0) > COALESCE({$prefix}grn_stats.current_stock, 0)");
                    } else if ($stockLevel === 'ZERO_STOCK') {
                        $query->whereRaw("COALESCE({$prefix}grn_stats.current_stock, 0) = 0");
                    }
                })
                ->orderBy("running_demand_stats.running_demand", 'desc');

            $results = $this->applyPaginate($reportQuery);
        } else {
            $results = [
                'meta' => [],
                'results' => [],
                'logistic_name' => $logisticName,
            ];
        }

        $responseData = [
            // 'meta' => $results['meta'],
            'results' => $results['results'],
            'logistic_name' => $logisticName,
        ];
        return $responseData;
    }

    public function getItemLifecycleStockReport()
    {
        $oDataParams = $this->oDataService->getFilterQueryParams();
        $logisticId = $oDataParams['logistic_id'] ?? null;
        $searchItemIds = $oDataParams['item_ids'] ?? [];
        $stockLevel = $oDataParams['stock_level'] ?? null;
        $financialYear = $oDataParams['financial_year'] ?? null; // "2026-2027"
        // $helper = new Helper;
        $dateRange = $this->getFiscalYearRange($financialYear); // if null then it take running financial year
        // $startDate = substr($dateRange['start_date'], 0, 10);
        // $endDate = substr($dateRange['end_date'], 0, 10);
        $prefix = DB::connection()->getTablePrefix() ?? '';

        if ($logisticId && $logisticId !== 'ALL') {
            $logisticInfo = (new LogisticRepository())->findById($logisticId);
            $logisticName = $logisticInfo->name ?? '';
        } else {
            $logisticId = null;
            $logisticName = 'All Logistics';
        }

        $warehouseInfo = (new BranchRepository())->getWarehouseInfo();
        if (empty($warehouseInfo)) {
            return [
                'meta' => [],
                'results' => [],
                'logistic_name' => $logisticName,
            ];
        }
        $warehouseId = $warehouseInfo->id ?? null; // Default warehouse branch

        if (!empty($warehouseId)) {
            // Subquery for GRN Stats
            $grnStats = (new ItemStockRepository())
                ->newQuery()
                ->select(
                    'item_stocks.item_id',
                    DB::raw("SUM({$prefix}item_stocks.quantity) as total_grn_qty"),
                    DB::raw("SUM({$prefix}item_stocks.balance_quantity) as current_stock"),
                    DB::raw("MAX({$prefix}item_stocks.created_at) as last_grn_date")
                )
                ->where('item_stocks.branch_id', $warehouseId)
                ->whereBetween('item_stocks.created_at', [$dateRange['start_date'], $dateRange['end_date']])
                ->when(!empty($logisticId), function ($query) use ($logisticId) {
                    $query->whereHas('itemInfo', function ($q) use ($logisticId) {
                        $q->where('logistic_id', $logisticId);
                    });
                })
                ->when(!empty($searchItemIds), function ($query) use ($searchItemIds) {
                    $query->whereIn('item_stocks.item_id', $searchItemIds);
                })
                ->groupBy('item_stocks.item_id');

            // Subquery for Disbursed Stats
            $disbursedStats = (new ItemStockRepository())
                ->newQuery()
                ->select(
                    'item_stocks.item_id',
                    DB::raw("SUM({$prefix}item_stocks.quantity) as total_disburse_qty"),
                    DB::raw("MAX({$prefix}item_stocks.created_at) as last_disburse_date")
                )
                ->whereNot('item_stocks.branch_id', $warehouseId)
                ->whereBetween('item_stocks.created_at', [$dateRange['start_date'], $dateRange['end_date']])
                ->when(!empty($logisticId), function ($query) use ($logisticId) {
                    $query->whereHas('itemInfo', function ($q) use ($logisticId) {
                        $q->where('logistic_id', $logisticId);
                    });
                })
                ->when(!empty($searchItemIds), function ($query) use ($searchItemIds) {
                    $query->whereIn('item_stocks.item_id', $searchItemIds);
                })
                ->whereIn('item_stocks.action_from', ['Material_Requisition', 'Stock_Transfer'])
                ->groupBy('item_stocks.item_id');

            // Subquery for Running Demand
            $runningDemandStats = (new RequisitionItemRepository())
                ->newQuery()
                ->select(
                    'requisition_items.item_id',
                    DB::raw("SUM({$prefix}requisition_items.request_quantity) as running_demand")
                )
                ->join('requisitions', 'requisition_items.requisition_id', '=', 'requisitions.id')
                // ->where('requisitions.branch_id', $warehouseId)
                ->when(!empty($searchItemIds), function ($query) use ($searchItemIds) {
                    $query->whereIn('requisition_items.item_id', $searchItemIds);
                })
                ->whereNotIn('requisitions.process_status', ['DISBURSED', 'ACKNOWLEDGED', 'REJECTED'])
                ->whereBetween('requisitions.created_at', [$dateRange['start_date'], $dateRange['end_date']])
                ->groupBy('requisition_items.item_id');

            // Main Query
            $reportQuery = (new ItemRepository())
                ->newQuery()
                ->select(
                    'items.id',
                    'items.code',
                    'items.name_en',
                    'items.name_bn',
                    'item_categories.name as category_name',
                    'units.short_name as unit_name',
                    DB::raw("COALESCE({$prefix}grn_stats.total_grn_qty, 0) as total_grn_qty"),
                    DB::raw("COALESCE({$prefix}disbursed_stats.total_disburse_qty, 0) as total_disburse_qty"),
                    DB::raw("COALESCE({$prefix}grn_stats.current_stock, 0) as current_stock"),
                    DB::raw("COALESCE({$prefix}running_demand_stats.running_demand, 0) as running_demand"),
                    DB::raw("(COALESCE({$prefix}grn_stats.current_stock, 0) - COALESCE({$prefix}running_demand_stats.running_demand, 0)) as demand_stock_gap"),
                    // DB::raw("CASE WHEN (COALESCE({$prefix}grn_stats.current_stock, 0) - COALESCE({$prefix}running_demand_stats.running_demand, 0)) < 0 THEN 'Risk' ELSE 'Safe' END as risk_status"),
                    DB::raw("CASE
                        WHEN COALESCE({$prefix}grn_stats.current_stock, 0) = 0 THEN 'Danger'
                        WHEN (COALESCE({$prefix}grn_stats.current_stock, 0) - COALESCE({$prefix}running_demand_stats.running_demand, 0)) < 0 THEN 'Risk'
                        ELSE 'Safe'
                    END as risk_status"),
                    DB::raw("{$prefix}grn_stats.last_grn_date"),
                    DB::raw("{$prefix}disbursed_stats.last_disburse_date")
                )
                ->leftJoin('item_categories', 'items.item_category_id', '=', 'item_categories.id')
                ->leftJoin('units', 'items.base_unit_id', '=', 'units.id')
                ->leftJoinSub($grnStats, 'grn_stats', function ($join) {
                    $join->on('items.id', '=', 'grn_stats.item_id');
                })
                ->leftJoinSub($disbursedStats, 'disbursed_stats', function ($join) {
                    $join->on('items.id', '=', 'disbursed_stats.item_id');
                })
                ->leftJoinSub($runningDemandStats, 'running_demand_stats', function ($join) {
                    $join->on('items.id', '=', 'running_demand_stats.item_id');
                })
                ->when(!empty($logisticId), function ($query) use ($logisticId) {
                    $query->where('items.logistic_id', $logisticId);
                })
                ->when(!empty($searchItemIds), function ($query) use ($searchItemIds) {
                    $query->whereIn('items.id', $searchItemIds);
                })
                ->when(!empty($stockLevel), function ($query) use ($stockLevel, $prefix) {
                    if ($stockLevel === 'SAFE') {
                        $query->whereRaw("COALESCE({$prefix}grn_stats.current_stock, 0) > COALESCE({$prefix}running_demand_stats.running_demand, 0)");
                    } else if ($stockLevel === 'DEMAND_GT_STOCK') {
                        $query->whereRaw("COALESCE({$prefix}running_demand_stats.running_demand, 0) > COALESCE({$prefix}grn_stats.current_stock, 0)");
                    } else if ($stockLevel === 'ZERO_STOCK') {
                        $query->whereRaw("COALESCE({$prefix}grn_stats.current_stock, 0) = 0");
                    } else if ($stockLevel === 'HIGH_DEMAND') {
                        $query->whereRaw("COALESCE({$prefix}running_demand_stats.running_demand, 0) > 0");
                    }
                })
                ->orderBy("running_demand_stats.running_demand", 'desc');

            $results = $this->applyPaginate($reportQuery);
        } else {
            $results = [
                'meta' => [],
                'results' => [],
                'logistic_name' => $logisticName,
            ];
        }

        $responseData = [
            'meta' => $results['meta'],
            'results' => $results['results'],
            'logistic_name' => $logisticName,
        ];
        return $responseData;
    }

    public function getFiscalYearRange(?string $financialYear = null): array
    {
        if (empty($financialYear)) {
            $now = Carbon::now('Asia/Dhaka');
            $startYear = $now->month >= 7 ? $now->year : $now->year - 1;
            $endYear   = $startYear + 1;
        } else {
            $parts = explode('-', $financialYear);
            if (count($parts) < 2) {
                throw new \InvalidArgumentException('Invalid financial year format');
            }
            $startYear = (int) trim($parts[0]);
            $endYear   = (int) trim($parts[1]);
            if ($startYear <= 0 || $endYear <= 0) {
                throw new \InvalidArgumentException('Invalid financial year values');
            }
        }

        return [
            'start_date' => Carbon::createFromDate($startYear, 7, 1)->startOfDay()->toDateTimeString(),
            'end_date'   => Carbon::createFromDate($endYear, 6, 30)->endOfDay()->toDateTimeString(),
        ];
    }

    // public function getFiscalYearRange(?string $financialYear = null): array
    // {
    //     if (empty($financialYear)) {
    //         $now = Carbon::now('Asia/Dhaka');
    //         $startYear = $now->month >= 7 ? $now->year : $now->year - 1;
    //         $endYear   = $startYear + 1;
    //     } else {
    //         [$startYear, $endYear] = explode('-', $financialYear);
    //     }

    //     return [
    //         'start_date' => Carbon::createFromDate($startYear, 7, 1)->startOfDay()->toDateTimeString(),   // "2025-07-01 00:00:00"
    //         'end_date'   => Carbon::createFromDate($endYear, 6, 30)->endOfDay()->toDateTimeString(),       // "2026-06-30 23:59:59"
    //     ];
    // }


}
