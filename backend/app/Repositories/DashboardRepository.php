<?php

namespace App\Repositories;

use App\Services\ODataService;
use App\Http\Resources\DashboardResource;
use App\Repositories\BaseRepository;
use App\Repositories\RequisitionRepository;
use App\Repositories\GoodsReceiveNoteRepository;
use App\Repositories\StockAdjustmentRepository;
use App\Services\SessionService;
use Log;


class DashboardRepository extends BaseRepository
{
    /**
     * @var Dashboard
     */

    protected $request;


    public function init()
    {
        $this->request      = request();
        $this->oDataService = (new ODataService())->init();
        return $this;
    }

    public function dashboardStats()
    {
        return [
            'requisitions' => $this->getRequisitions(),
            'my_requisitions' => $this->getMyRequisitions(),
            'current_stock_items_qty' => $this->getCurrentStockItemsQty(),
            'empty_stock_items_qty' => $this->emptyStockQty(),
            'high_demand_items_qty' => $this->highDemandItemsQty(),
            'grn' => $this->getGRNs(),
            'stock_adjustments' => $this->getStockAdjustments(),
            'requisitions_per_month' => $this->getRequisitionsPerMonth(),
            'requisitions_status' => $this->getRequisitionsStatus(),
            'grn_status' => $this->getGRNStatus(),
            'stock_adjustment_status' => $this->getStockAdjustmentStatus(),
            'item_disbursement_status' => $this->getItemDisbursmentStatus(),
            'thana_wise_requisition' => $this->getThanaWiseRequisition(),
        ];
    }

    public function getRequisitions()
    {
        $query = (new RequisitionRepository())
            ->newQuery()
            ->get();

        // STEP WISE REQUISITION QTY
        $pendingQty = (clone $query)
            ->whereIn('process_status', ['SUBMITTED'])
            ->count();

        $delegatedQty = (clone $query)
            ->whereIn('process_status', ['DELEGATED'])
            ->count();

        $approvedQty = (clone $query)
            ->whereIn('process_status', ['APPROVED'])
            ->count();

        $disbursedQty = (clone $query)
            ->whereIn('process_status', ['DISBURSED', 'ACKNOWLEDGED'])
            ->count();

        $requisitionCounts = (clone $query)
            ->count();

        $approvedData = (clone $query)
            ->where('process_status', 'APPROVED')
            ->count();

        $rejectedData = (clone $query)
            ->where('process_status', 'REJECTED')
            ->count();

        $responseData = [
            'total_record_qty' => $requisitionCounts,
            'pending_qty'      => $pendingQty ?? 0,
            'delegated_qty'    => $delegatedQty ?? 0,
            'approved_qty'     => $approvedQty ?? 0,
            'disbursed_qty'    => $disbursedQty ?? 0,
            'rejected_qty'     => $rejectedData,
            'funnel_data' => [
                'pending_qty'      => $pendingQty ?? 0,
                'delegated_qty'    => $delegatedQty ?? 0,
                'approved_qty'     => $approvedQty ?? 0,
                'disbursed_qty'    => $disbursedQty ?? 0,
            ]
        ];


        return $responseData;
    }

    // current stocked items qty from ItemStockRepository
    public function getCurrentStockItemsQty()
    {
        return (new ItemStockRepository)
            ->newQuery()
            ->select('item_id')
            ->where('balance_quantity', '>', 0)
            ->groupBy('item_id')
            ->get()
            ->count();
    }

    // my requisitions
    public function getMyRequisitions()
    {
        // session user id
        // Get user data from session
        $sessionService = (new SessionService())->init();
        $userData = $sessionService->getUserData();
        $userId = $userData['id'];

        $query = (new RequisitionRepository())
            ->newQuery()
            ->where('created_by', $userId)
            ->get();

        $totalReqQty = (clone $query)
            ->count();

        $responseData = [
            'total_requisition_qty' => $totalReqQty,
        ];

        return $responseData;
    }

    public function getGRNs()
    {
        $query = (new GoodsReceiveNoteRepository)
            ->newQuery()
            ->get();

        $grnCount = (clone $query)
            ->count();

        $submitData = (clone $query)
            ->where('process_status', 'SUBMITTED')
            ->count();

        $approvedData = (clone $query)
            ->where('process_status', 'APPROVED')
            ->count();

        $rejectedData = (clone $query)
            ->where('process_status', 'REJECTED')
            ->count();

        $responseData = [
            'total_record_qty' => $grnCount,
            'pending_qty'      => $submitData,
            'rejected_qty'     => $rejectedData,
            'approved_qty'     => $approvedData,
        ];

        return $responseData;
    }

    public function getStockAdjustments()
    {
        $query = (new StockAdjustmentRepository)
            ->newQuery()
            ->get();

        $stockAdjustmentCount = (clone $query)
            ->count();

        $submitData = (clone $query)
            ->where('process_status', 'SUBMITTED')
            ->count();

        $approvedData = (clone $query)
            ->where('process_status', 'APPROVED')
            ->count();

        $rejectedData = (clone $query)
            ->where('process_status', 'REJECTED')
            ->count();

        $responseData = [
            'total_record_qty' => $stockAdjustmentCount,
            'pending_qty'      => $submitData,
            'rejected_qty'     => $rejectedData,
            'approved_qty'     => $approvedData,
        ];

        return $responseData;
    }

    public function getRequisitionsPerMonth()
    {
        $oDataParams = $this->oDataService->getFilterQueryParams();

        $query = (new RequisitionRepository())
            ->newQuery()
            ->selectRaw("TO_CHAR(created_at, 'YYYY-MM') as month, COUNT(*) as count")
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->pluck('count', 'month');


        // Ensure all 12 months are present with 0 if no records
        $months = collect();
        for ($i = 11; $i >= 0; $i--) {
            $month = now()->subMonths($i)->format('Y-m');
            $months->put($month, $query->get($month, 0));
        }

        return $months->values();
    }

    public function getRequisitionsStatus()
    {
        $query = (new RequisitionRepository())
            ->newQuery();

        $requisitionCounts = (clone $query)
            ->count();

        // START - PENDING
        $totalSubmittedRequisition = (clone $query)
            ->where('process_status', '=', 'SUBMITTED')
            ->count();

        $submitRequisitionOnToday =  (clone $query)
            ->where('process_status', '=', 'SUBMITTED')
            ->whereDate('created_at', now()->toDateString())
            ->count();

        $submitRequisitionPerCurrentMonth = (clone $query)
            ->where('process_status', '=', 'SUBMITTED')
            ->whereRaw("EXTRACT(MONTH FROM created_at) = ?", [now()->month])
            ->count();
        // END - PENDING

        // START - APPROVED
        $totalApprovedRequisition = (clone $query)
            ->where('process_status', '=', 'APPROVED')
            ->count();

        $approvedRequisitionOnToday = (clone $query)
            ->where('process_status', '=', 'APPROVED')
            ->whereDate('created_at', now()->toDateString())
            ->count();

        $approvedRequisitionPerCurrentMonth = (clone $query)
            ->where('process_status', '=', 'APPROVED')
            ->whereRaw("EXTRACT(MONTH FROM created_at) = ?", [now()->month])
            ->count();
        // END - APPROVED

        // START - REJECTED
        $totalRejectedRequisition = (clone $query)
            ->where('process_status', '=', 'REJECTED')
            ->count();

        $rejectedRequisitionOnToday = (clone $query)
            ->where('process_status', '=', 'REJECTED')
            ->whereDate('created_at', now()->toDateString())
            ->count();

        $rejectedRequisitionPerCurrentMonth = (clone $query)
            ->where('process_status', '=', 'REJECTED')
            ->whereRaw("EXTRACT(MONTH FROM created_at) = ?", [now()->month])
            ->count();
        // END - REJECTED

        $responseData = [
            'total_record_qty' => $requisitionCounts,
            'total_pending_qty'      => $totalSubmittedRequisition,
            'pending_qty_per_current_day' => $submitRequisitionOnToday,
            'pending_qty_per_current_month' => $submitRequisitionPerCurrentMonth,
            'total_approved_qty'     => $totalApprovedRequisition,
            'approved_qty_per_current_day' => $approvedRequisitionOnToday,
            'approved_qty_per_current_month' => $approvedRequisitionPerCurrentMonth,
            'total_rejected_qty'     => $totalRejectedRequisition,
            'rejected_qty_per_current_day' => $rejectedRequisitionOnToday,
            'rejected_qty_per_current_month' => $rejectedRequisitionPerCurrentMonth,

        ];

        return $responseData;
    }

    public function getGRNStatus()
    {

        $query = (new GoodsReceiveNoteRepository())
            ->newQuery();


        $grnCounts = (clone $query)
            ->count();

        $totalSubmittedGrn = (clone $query)
            ->where('process_status', '=', 'SUBMITTED')
            ->count();

        $submitGrnOnToday =  (clone $query)
            ->where('process_status', '=', 'SUBMITTED')
            ->whereDate('created_at', now()->toDateString())
            ->count();

        $submitGrnPerCurrentMonth = (clone $query)
            ->where('process_status', '=', 'SUBMITTED')
            ->whereRaw("EXTRACT(MONTH FROM created_at) = ?", [now()->month])
            ->count();

        $approvedGrnOnToday = (clone $query)
            ->where('process_status', '=', 'APPROVED')
            ->whereDate('created_at', now()->toDateString())
            ->count();

        $approvedGrnPerCurrentMonth = (clone $query)
            ->where('process_status', '=', 'APPROVED')
            ->whereRaw("EXTRACT(MONTH FROM created_at) = ?", [now()->month])
            ->count();

        $rejectedGrnOnToday = (clone $query)
            ->where('process_status', '=', 'REJECTED')
            ->whereDate('created_at', now()->toDateString())
            ->count();

        $rejectedGrnPerCurrentMonth = (clone $query)
            ->where('process_status', '=', 'REJECTED')
            ->whereRaw("EXTRACT(MONTH FROM created_at) = ?", [now()->month])
            ->count();

        $rejectedGrnOnToday = (clone $query)
            ->where('process_status', '=', 'REJECTED')
            ->whereDate('created_at', now()->toDateString())
            ->count();


        $totalApprovedGrn = (clone $query)
            ->where('process_status', '=', 'APPROVED')
            ->count();

        $totalRejectedGrn = (clone $query)
            ->where('process_status', '=', 'REJECTED')
            ->count();

        $responseData = [
            'total_record_qty' => $grnCounts,
            'total_pending_qty'      => $totalSubmittedGrn,
            'pending_qty_per_current_day' => $submitGrnOnToday,
            'pending_qty_per_current_month' => $submitGrnPerCurrentMonth,
            'total_approved_qty'     => $totalApprovedGrn,
            'approved_qty_per_current_day' => $approvedGrnOnToday,
            'approved_qty_per_current_month' => $approvedGrnPerCurrentMonth,
            'total_rejected_qty'     => $totalRejectedGrn,
            'rejected_qty_per_current_month' => $rejectedGrnPerCurrentMonth,
            'rejected_qty_per_current_day' => $rejectedGrnOnToday,
        ];

        return $responseData;
    }

    public function getStockAdjustmentStatus()
    {

        $query = (new StockAdjustmentRepository())
            ->newQuery();


        $stockAdjustmentCounts = (clone $query)
            ->count();

        $totalSubmittedStockAdjustment = (clone $query)
            ->where('process_status', '=', 'SUBMITTED')
            ->count();

        $submitStockAdjustmentOnToday =  (clone $query)
            ->where('process_status', '=', 'SUBMITTED')
            ->whereDate('created_at', now()->toDateString())
            ->count();

        $submitStockAdjustmentPerCurrentMonth = (clone $query)
            ->where('process_status', '=', 'SUBMITTED')
            ->whereRaw("EXTRACT(MONTH FROM created_at) = ?", [now()->month])
            ->count();

        $approvedStockAdjustmentOnToday = (clone $query)
            ->where('process_status', '=', 'APPROVED')
            ->whereDate('created_at', now()->toDateString())
            ->count();

        $approvedStockAdjustmentPerCurrentMonth = (clone $query)
            ->where('process_status', '=', 'APPROVED')
            ->whereRaw("EXTRACT(MONTH FROM created_at) = ?", [now()->month])
            ->count();

        $rejectedStockAdjustmentOnToday = (clone $query)
            ->where('process_status', '=', 'REJECTED')
            ->whereDate('created_at', now()->toDateString())
            ->count();

        $rejectedStockAdjustmentPerCurrentMonth = (clone $query)
            ->where('process_status', '=', 'REJECTED')
            ->whereRaw("EXTRACT(MONTH FROM created_at) = ?", [now()->month])
            ->count();

        $rejectedStockAdjustmentOnToday = (clone $query)
            ->where('process_status', '=', 'REJECTED')
            ->whereDate('created_at', now()->toDateString())
            ->count();


        $totalApprovedStockAdjustment = (clone $query)
            ->where('process_status', '=', 'APPROVED')
            ->count();

        $totalRejectedStockAdjustment = (clone $query)
            ->where('process_status', '=', 'REJECTED')
            ->count();

        $responseData = [
            'total_record_qty' => $stockAdjustmentCounts,
            'total_pending_qty'      => $totalSubmittedStockAdjustment,
            'pending_qty_per_current_day' => $submitStockAdjustmentOnToday,
            'pending_qty_per_current_month' => $submitStockAdjustmentPerCurrentMonth,
            'total_approved_qty'     => $totalApprovedStockAdjustment,
            'approved_qty_per_current_day' => $approvedStockAdjustmentOnToday,
            'approved_qty_per_current_month' => $approvedStockAdjustmentPerCurrentMonth,
            'total_rejected_qty'     => $totalRejectedStockAdjustment,
            'rejected_qty_per_current_month' => $rejectedStockAdjustmentPerCurrentMonth,
            'rejected_qty_per_current_day' => $rejectedStockAdjustmentOnToday,

        ];

        return $responseData;
    }

    public function getItemDisbursmentStatus()
    {
        $query = (new RequisitionRepository())
            ->newQuery()
            ->get();

        $submittedRequisitions = (clone $query)
            ->where('process_status', '=', 'SUBMITTED')
            ->count();

        $delegatedRequisitions = (clone $query)
            ->where('process_status', '=', 'DELEGATED')
            ->count();

        $approvedRequisitions = (clone $query)
            ->where('process_status', '=', 'APPROVED')
            ->count();

        $disbursedRequisitions = (clone $query)
            ->where('process_status', '=', 'DISBURSED')
            ->count();

        $acknowledgedRequisitions = (clone $query)
            ->where('process_status', '=', 'ACKNOWLEDGED')
            ->count();

        $responseData = [
            'total_submitted_qty'      => $submittedRequisitions,
            'total_delegated_qty'      => $delegatedRequisitions,
            'total_approved_qty'     => $approvedRequisitions,
            'total_disbursed_qty'     => $disbursedRequisitions,
            'total_acknowledged_qty'     => $acknowledgedRequisitions,
        ];
        return $responseData;
    }

    public function getThanaWiseRequisition()
    {
        $query = (new RequisitionRepository())
            ->newQuery();

        $thanaCounts = (clone $query)
            ->distinct('branch_id')
            ->count('branch_id');


        $requisitionCounts = (clone $query)
            ->count();

        $delayRequisitionCounts = (clone $query)
            ->where('process_status', '=', 'DELAYED')
            ->count();

        $thanaList = (clone $query)
            ->join('branches', 'branches.id', '=', 'requisitions.branch_id')
            ->distinct()
            ->pluck('branches.name');

        $thanaWiseTotalRequisitionCounts = $thanaList
            ->map(function ($thana) use ($query) {
                return [
                    'thana' => $thana,
                    'count' => (clone $query)
                        ->join('branches', 'branches.id', '=', 'requisitions.branch_id')
                        ->where('branches.name', $thana)
                        ->count(),
                ];
            });

        $thanaWisePendingRequisitionCountes = $thanaList
            ->map(function ($thana) use ($query) {
                return [
                    'thana' => $thana,
                    'count' => (clone $query)
                        ->join('branches', 'branches.id', '=', 'requisitions.branch_id')
                        ->where('branches.name', $thana)
                        ->where('process_status', '=', 'PENDING')
                        ->count(),
                ];
            });


        $thanaWiseApprovedRequsitionCounts = $thanaList
            ->map(function ($thana) use ($query) {
                return [
                    'thana' => $thana,
                    'count' => (clone $query)
                        ->join('branches', 'branches.id', '=', 'requisitions.branch_id')
                        ->where('branches.name', $thana)
                        ->where('process_status', '=', 'APPROVED')
                        ->count(),
                ];
            });

        $thanaWiseRejectedRequsitionCounts = $thanaList
            ->map(function ($thana) use ($query) {
                return [
                    'thana' => $thana,
                    'count' => (clone $query)
                        ->join('branches', 'branches.id', '=', 'requisitions.branch_id')
                        ->where('branches.name', $thana)
                        ->where('process_status', '=', 'REJECTED')
                        ->count(),
                ];
            });

        $thanaWiseDelayRequisitionCounts = $thanaList
            ->map(function ($thana) use ($query) {
                return [
                    'thana' => $thana,
                    'count' => (clone $query)
                        ->join('branches', 'branches.id', '=', 'requisitions.branch_id')
                        ->where('branches.name', $thana)
                        ->where('process_status', '=', 'DELAYED')
                        ->count(),
                ];
            });


        $responseData = [
            'thanaCounts' => $thanaCounts,
            'requisitionCounts' => $requisitionCounts,
            'delayRequisitionCounts' => $delayRequisitionCounts,
            'thanaList' => $thanaList,
            'thanaWiseTotalRequisitionCounts' => $thanaWiseTotalRequisitionCounts,
            'thanaWisePendingRequisitionCountes' => $thanaWisePendingRequisitionCountes,
            'thanaWiseApprovedRequsitionCounts' => $thanaWiseApprovedRequsitionCounts,
            'thanaWiseRejectedRequsitionCounts' => $thanaWiseRejectedRequsitionCounts,
            'thanaWiseDelayRequisitionCounts' => $thanaWiseDelayRequisitionCounts,
        ];

        return $responseData;
    }

    public function emptyStockQty()
    {
        return (new ItemStockRepository())->countItemsNotInStock();
    }

    public function highDemandItemsQty()
    {
        // Count distinct items that appear in requisitions which are
        // not DISBURSED (i.e. currently requested). Returns an integer.
        $count = (new RequisitionItemRepository())
            ->newQuery()
            ->join('requisitions', 'requisition_items.requisition_id', '=', 'requisitions.id')
            ->whereNotIn('requisitions.process_status', ['DISBURSED', 'ACKNOWLEDGED'])
            ->distinct()
            ->count('requisition_items.item_id');

        return $count;
    }
}
