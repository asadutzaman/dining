<?php

namespace App\Repositories;

use App\Models\RequisitionItem;
use App\Services\ODataService;
use Carbon\Carbon;
use Helper;
use Illuminate\Support\Facades\DB;

class RequisitionItemRepository extends BaseRepository
{
    /**
     * @var RequisitionItem
     */
    protected $model;

    protected $request;

    protected $oDataService;

    protected $fieldSearchable = ['requisition_id'];

    public function __construct()
    {
        $this->model         = new RequisitionItem();
    }
    protected function init()
    {
        $this->request      = request();
        $this->oDataService = (new ODataService())->init();
    }

    public function deleteRequisitionItemByIds($requisitionId, $requisitionItemIds)
    {
        return $this->newQuery()
            ->where('requisition_id', $requisitionId)
            ->whereNotIn('id', $requisitionItemIds)
            ->delete();
    }

    // Item Wise Disbursement Details
    public function getItemDisbursementDetails($params)
    {
        $itemId = $params['item_id'] ?? null;
        $financialYear = $params['financial_year'] ?? null; // "2026-2027"
        // $helper = new Helper;
        $dateRange = $this->getFiscalYearRange($financialYear); // if null then it take running financial year
        if (!$itemId && !$dateRange) {
            return [];
        }
        // get the sum of disbursed quantity of previous years
        $prefix = DB::connection()->getTablePrefix() ?? '';
        $previousYearsDisbursedQuantity = $this->newQuery()
            ->join('requisitions', 'requisitions.id', '=', 'requisition_items.requisition_id')
            ->where('requisitions.process_status', ['DISBURSED', 'ACKNOWLEDGED'])
            ->where('requisitions.updated_at', '<', $dateRange['start_date'])
            // ->whereYear('requisitions.updated_at', '<', $financialYear)
            // ->whereNotBetween('requisitions.created_at', [$dateRange['start_date'], $dateRange['end_date']])
            ->where('requisition_items.item_id', $itemId)
            ->whereRaw("COALESCE({$prefix}requisition_items.revised_quantity, {$prefix}requisition_items.request_quantity, 0) > 0")
            ->selectRaw("COALESCE({$prefix}requisition_items.revised_quantity, {$prefix}requisition_items.request_quantity, 0) as received_quantity")
            ->get()
            ->sum('received_quantity');

        $previousYearsDisbursedData = collect([
            'previous_year' => true,
            'disbursement_date' => null,
            'received_quantity' => $previousYearsDisbursedQuantity,
            'requested_by' => '--',
            'requisition_number' => '--',
            'thana' => '--',
        ]);
        $currentYearDisbursedData = $this->newQuery()
            ->whereIn('requisitions.process_status', ['DISBURSED', 'ACKNOWLEDGED'])
            // ->whereYear('requisitions.updated_at', now()->year)
            // ->whereYear('requisitions.updated_at', $financialYear)
            ->whereBetween('requisitions.created_at', [$dateRange['start_date'], $dateRange['end_date']])
            ->where('requisition_items.item_id', $itemId)
            ->select(
                'requisition_number as requisition_number',
                'requisitions.updated_at as disbursement_date',
                'users.name as requested_by',
                'branches.name as thana'
            )
            ->selectRaw('CASE WHEN revised_quantity IS NOT NULL THEN revised_quantity ELSE request_quantity END as received_quantity')
            ->join('requisitions', 'requisition_items.requisition_id', '=', 'requisitions.id')
            ->join('users', 'requisitions.created_by', '=', 'users.id')
            ->join('branches', 'requisitions.branch_id', '=', 'branches.id')
            ->get();
        // push disbursed data to current year disbursed data
        $results = $currentYearDisbursedData->push($previousYearsDisbursedData);
        return $results;
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
}
