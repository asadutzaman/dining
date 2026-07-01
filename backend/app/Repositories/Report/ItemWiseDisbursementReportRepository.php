<?php

namespace App\Repositories\Report;

use App\Models\Report\ItemWiseDisbursementReport;
use App\Repositories\BaseRepository;
use App\Repositories\RequisitionItemRepository;
use App\Repositories\ItemRepository;
use App\Services\ODataService;
use Illuminate\Support\Facades\DB;


class ItemWiseDisbursementReportRepository extends BaseRepository
{
    /**
     * @var itemWiseDisbursementReport
     */

    protected $request;
    protected $reportQuery;

    public function init()
    {
        $this->request      = request();
        $this->oDataService = (new ODataService())->init();
        return $this;
    }

    public function getItemWiseDisbursementList()
    {
        $oDataParams = $this->oDataService->getFilterQueryParams();
        $prefix = DB::connection()->getTablePrefix() ?? '';
        if (!empty($oDataParams['item_id'])) {
            $itemInfo = (new ItemRepository())
                ->findById($oDataParams['item_id']);

            $disbursementHistories = (new RequisitionItemRepository())
                ->newQuery()
                ->select([
                    'requisitions.created_by as requester_id',
                    'users.name as requester_name',
                    'requisition_items.item_id',
                    'items.code',
                    'items.name_en as item_name_en',
                    'items.name_bn as item_name_bn',
                    'branches.name as dmp_unit',
                ])
                ->selectRaw("STRING_AGG(DISTINCT {$prefix}requisitions.requisition_number::text,', ') as no_of_requisitions")
                ->selectRaw("SUM({$prefix}requisition_items.request_quantity) as total_requested_qty")
                ->selectRaw("SUM(COALESCE({$prefix}requisition_items.revised_quantity,{$prefix}requisition_items.request_quantity,0)) as total_received_qty")
                ->selectRaw("MAX({$prefix}requisitions.updated_at) as last_received_date")
                ->join('requisitions', 'requisition_items.requisition_id', '=', 'requisitions.id')
                ->join('users', 'requisitions.created_by', '=', 'users.id')
                ->join('items', 'requisition_items.item_id', '=', 'items.id')
                ->join('branches', 'requisitions.branch_id', '=', 'branches.id')
                ->where('requisition_items.item_id', $oDataParams['item_id'])
                ->whereIn('requisitions.process_status', ['DISBURSED', 'ACKNOWLEDGED'])
                ->groupBy(
                    'requisitions.created_by',
                    'users.name',
                    'requisition_items.item_id',
                    'items.code',
                    'items.name_en',
                    'items.name_bn',
                    'branches.name'
                )
                ->get();
        } else {
            $disbursementHistories = [];
            $itemInfo = null;
        }

        $results = [
            'meta'    => [],
            'results' => $disbursementHistories,
            'itemInfo' => $itemInfo,
        ];

        return $results;
    }

    public function getItemWiseDisbursementExport()
    {
        $oDataParams = $this->oDataService->getFilterQueryParams();
        $prefix = DB::connection()->getTablePrefix() ?? '';
        if (!empty($oDataParams['item_id'])) {
            $disbursementHistories = (new RequisitionItemRepository())
                ->newQuery()
                ->select([
                    'requisitions.created_by as requester_id',
                    'users.name as requester_name',
                    'requisition_items.item_id',
                    'items.code',
                    'items.name_en as item_name_en',
                    'items.name_bn as item_name_bn',
                    'branches.name as dmp_unit',
                ])
                // ->selectRaw("COUNT(DISTINCT {$prefix}requisitions.id) as no_of_requisitions")
                ->selectRaw("STRING_AGG(DISTINCT {$prefix}requisitions.requisition_number::text,', ') as no_of_requisitions")
                ->selectRaw("SUM({$prefix}requisition_items.request_quantity) as total_requested_qty")
                ->selectRaw("SUM(COALESCE({$prefix}requisition_items.revised_quantity,{$prefix}requisition_items.request_quantity,0)) as total_received_qty")
                ->selectRaw("MAX({$prefix}requisitions.updated_at) as last_received_date")
                ->join('requisitions', 'requisition_items.requisition_id', '=', 'requisitions.id')
                ->join('users', 'requisitions.created_by', '=', 'users.id')
                ->join('items', 'requisition_items.item_id', '=', 'items.id')
                ->join('branches', 'requisitions.branch_id', '=', 'branches.id')
                ->where('requisition_items.item_id', $oDataParams['item_id'])
                ->whereIn('requisitions.process_status', ['DISBURSED', 'ACKNOWLEDGED'])
                ->groupBy(
                    'requisitions.created_by',
                    'users.name',
                    'requisition_items.item_id',
                    'items.code',
                    'items.name_en',
                    'items.name_bn',
                    'branches.name'
                )
                ->get();
        } else {
            $disbursementHistories = [];
        }

        $results = [
            'results' => $disbursementHistories,
        ];

        return $results;
    }
}
