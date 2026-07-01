<?php

namespace App\Repositories\Report;

use App\Models\RequesterWiseDisbursementReport;
use App\Services\ODataService;
use App\Repositories\BaseRepository;
use App\Repositories\RequisitionItemRepository;
use App\Repositories\UserRepository;
use Illuminate\Support\Facades\DB;

class RequesterWiseDisbursementReportRepository extends BaseRepository
{
    /**
     * @var RequesterWiseDisbursementReport
     */
    protected $request;
    protected $reportQuery;

    public function init()
    {
        $this->request      = request();
        $this->oDataService = (new ODataService())->init();
        return $this;
    }

    public function getRequesterWiseDisbursementList()
    {
        $oDataParams = $this->oDataService->getFilterQueryParams();

        $prefix = DB::connection()->getTablePrefix() ?? '';

        if (!empty($oDataParams['user_id'])) {
            $requesterId = $oDataParams['user_id'];
            $requesterInfo = (new UserRepository())
                ->newQuery()
                ->with([
                    'branch:id,name',
                    'designation:id,title'
                ])
                ->find($requesterId);

            $disbursementHistories = (new RequisitionItemRepository())
                ->newQuery()
                ->select([
                    'requisitions.created_by as requester_id',
                    'requisitions.requisition_number as requisition_no',
                    'requisition_items.item_id',
                    'items.code',
                    'items.name_en',
                    'items.name_bn',
                    'units.short_name as unit',
                ])
                ->selectRaw("STRING_AGG(DISTINCT {$prefix}requisitions.requisition_number::text,', ') as requisition_nos")
                ->selectRaw("SUM({$prefix}requisition_items.request_quantity) as total_requested_qty")
                ->selectRaw("SUM(COALESCE({$prefix}requisition_items.revised_quantity, {$prefix}requisition_items.request_quantity, 0)) as total_received_qty")
                ->selectRaw("MAX({$prefix}requisitions.updated_at) as last_received_date")
                ->join('requisitions', 'requisitions.id', '=', 'requisition_items.requisition_id')
                ->join('items', 'items.id', '=', 'requisition_items.item_id')
                ->join('units', 'units.id', '=', 'items.base_unit_id')
                ->whereIn('requisitions.process_status', ['DISBURSED', 'ACKNOWLEDGED'])
                ->when(!empty($oDataParams['user_id']), function ($q) use ($oDataParams) {
                    $q->where('requisitions.created_by', $oDataParams['user_id']);
                })
                ->groupBy(
                    'requisitions.created_by',
                    'requisitions.requisition_number',
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
            'requesterInfo' => $requesterInfo,
        ];

        return $results;
    }

    public function getRequesterWiseDisbursementExport()
    {
        $oDataParams = $this->oDataService->getFilterQueryParams();

        $prefix = DB::connection()->getTablePrefix() ?? '';

        if (!empty($oDataParams['user_id'])) {
            $requesterId = $oDataParams['user_id'];
            $requesterInfo = (new UserRepository())
                ->newQuery()
                ->with([
                    'branch:id,name',
                    'designation:id,title'
                ])
                ->find($requesterId);

            $disbursementHistories = (new RequisitionItemRepository())
                ->newQuery()
                ->select([
                    'requisitions.created_by as requester_id',
                    'requisitions.requisition_number as requisition_no',
                    'requisition_items.item_id',
                    'items.code',
                    'items.name_en',
                    'items.name_bn',
                    'units.short_name as unit',
                ])
                ->selectRaw("STRING_AGG(DISTINCT {$prefix}requisitions.requisition_number::text,', ') as requisition_nos")
                ->selectRaw("SUM({$prefix}requisition_items.request_quantity) as total_requested_qty")
                ->selectRaw("SUM(COALESCE({$prefix}requisition_items.revised_quantity, {$prefix}requisition_items.request_quantity, 0)) as total_received_qty")
                ->selectRaw("MAX({$prefix}requisitions.updated_at) as last_received_date")
                ->join('requisitions', 'requisitions.id', '=', 'requisition_items.requisition_id')
                ->join('items', 'items.id', '=', 'requisition_items.item_id')
                ->join('units', 'units.id', '=', 'items.base_unit_id')
                ->whereIn('requisitions.process_status', ['DISBURSED', 'ACKNOWLEDGED'])
                ->when(!empty($oDataParams['user_id']), function ($q) use ($oDataParams) {
                    $q->where('requisitions.created_by', $oDataParams['user_id']);
                })
                ->groupBy(
                    'requisitions.created_by',
                    'requisitions.requisition_number',
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
            'requesterInfo' => $requesterInfo,
        ];

        return $results;
    }
}
