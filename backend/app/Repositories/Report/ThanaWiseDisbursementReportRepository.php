<?php

namespace App\Repositories\Report;

use App\Repositories\BaseRepository;
use App\Models\ThanaWiseDisbursementReport;
use App\Repositories\RequisitionItemRepository;
use App\Repositories\BranchRepository;
use App\Services\ODataService;
use Illuminate\Support\Facades\DB;


class ThanaWiseDisbursementReportRepository extends BaseRepository
{
    /**
     * @var ThanaWiseDisbursementReport
     */
    protected $request;
    protected $reportQuery;


    public function init()
    {
        $this->request      = request();
        $this->oDataService = (new ODataService())->init();
        return $this;
    }

    public function getThanaWiseDisbursementList()
    {
        $oDataParams = $this->oDataService->getFilterQueryParams();

        $prefix = DB::connection()->getTablePrefix() ?? '';

        if (!empty($oDataParams['branch_id'])) {
            $branchInfo = (new BranchRepository())
                ->newQuery()
                ->select(['id', 'name'])
                ->find($oDataParams['branch_id']);

            $disbursementHistories = (new RequisitionItemRepository())
                ->newQuery()
                ->select([
                    'requisition_items.item_id',
                    'items.code',
                    'items.name_en',
                    'items.name_bn',
                    'units.short_name as unit',
                ])
                ->selectRaw("SUM({$prefix}requisition_items.request_quantity) as total_requested_qty")
                ->selectRaw("SUM(COALESCE({$prefix}requisition_items.revised_quantity, {$prefix}requisition_items.request_quantity, 0)) as total_received_qty")
                ->selectRaw("MAX({$prefix}requisitions.updated_at) as last_received_date")
                ->join('requisitions', 'requisitions.id', '=', 'requisition_items.requisition_id')
                ->join('items', 'items.id', '=', 'requisition_items.item_id')
                ->join('units', 'units.id', '=', 'items.base_unit_id')
                ->whereIn('requisitions.process_status', ['DISBURSED', 'ACKNOWLEDGED'])
                ->when(!empty($oDataParams['branch_id']), function ($q) use ($oDataParams) {
                    $q->where('requisitions.branch_id', $oDataParams['branch_id']);
                })
                ->groupBy(
                    'requisition_items.item_id',
                    'items.code',
                    'items.name_en',
                    'items.name_bn',
                    'units.short_name',
                )
                ->get();
        }

        $results = [
            'meta'    => [],
            'results' => $disbursementHistories,
            'branchInfo' => $branchInfo,
        ];

        return $results;
    }



    public function getThanaWiseDisbursementExport()
    {
        $oDataParams = $this->oDataService->getFilterQueryParams();

        $prefix = DB::connection()->getTablePrefix() ?? '';

        if (!empty($oDataParams['branch_id'])) {
            $branchInfo = (new BranchRepository())
                ->newQuery()
                ->select(['id', 'name'])
                ->find($oDataParams['branch_id']);

            $disbursementHistories = (new RequisitionItemRepository())
                ->newQuery()
                ->select([
                    'requisition_items.item_id',
                    'items.code',
                    'items.name_en',
                    'items.name_bn',
                    'units.short_name as unit',
                ])
                ->selectRaw("SUM({$prefix}requisition_items.request_quantity) as total_requested_qty")
                ->selectRaw("SUM(COALESCE({$prefix}requisition_items.revised_quantity, {$prefix}requisition_items.request_quantity, 0)) as total_received_qty")
                ->selectRaw("MAX({$prefix}requisitions.updated_at) as last_received_date")
                ->join('requisitions', 'requisitions.id', '=', 'requisition_items.requisition_id')
                ->join('items', 'items.id', '=', 'requisition_items.item_id')
                ->join('units', 'units.id', '=', 'items.base_unit_id')
                ->whereIn('requisitions.process_status', ['DISBURSED', 'ACKNOWLEDGED'])
                ->when(!empty($oDataParams['branch_id']), function ($q) use ($oDataParams) {
                    $q->where('requisitions.branch_id', $oDataParams['branch_id']);
                })
                ->groupBy(
                    'requisition_items.item_id',
                    'items.code',
                    'items.name_en',
                    'items.name_bn',
                    'units.short_name',
                )
                ->get();
        }

        $results = [
            // 'meta'    => [],
            'results' => $disbursementHistories,
            'branchInfo' => $branchInfo,
        ];

        return $results;
    }
}
