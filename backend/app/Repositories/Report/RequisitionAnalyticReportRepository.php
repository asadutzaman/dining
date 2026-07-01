<?php

namespace App\Repositories\Report;

use App\Services\ODataService;
use App\Repositories\BaseRepository;
use App\Repositories\ItemStockRepository;
use App\Repositories\RequisitionRepository;
use App\Repositories\WorkflowStepPreconditionRepository;
use Illuminate\Support\Facades\Log;

class RequisitionAnalyticReportRepository extends BaseRepository
{
    protected $request;
    protected $reportQuery;

    public function init()
    {
        $this->request      = request();
        $this->oDataService = (new ODataService())->init();
        return $this;
    }

    public function getRequisitionAnalyticList()
    {
        $oDataParams = $this->oDataService->getFilterQueryParams();
        if (!empty($oDataParams['step_code'])) {
            $processStatus = [];
            if ($oDataParams['step_code'] == 'ALL') {
                $filterType = 'ALL';
            } else if ($oDataParams['step_code'] == 'PENDING') {
                $filterType = 'STEP';
                $processStatus = ['SUBMITTED'];
            } else {
                $filterType = 'STEP';
                $processStatus[] = $oDataParams['step_code'];
            }
        }
        $reportQuery = (new RequisitionRepository())
            ->newQuery()
            ->select('id', 'requisition_number', 'branch_id', 'logistic_id', 'subject', 'process_status', 'created_at', 'created_by')
            ->with([
                // 'stepInfo:id,name',
                'logistic:id,name,code',
                'branch:id,name',
                'createdBy:id,name',
            ])
            ->when($filterType, function ($query) use ($processStatus, $filterType) {
                if ($filterType != 'ALL') {
                    if ($filterType == 'REJECTED') {
                        $query->whereIn('process_status', ['REJECTED']);
                    } else {
                        $query->whereIn('process_status', $processStatus);
                    }
                } else {
                    $query->whereNotIn('process_status', ['DRAFT']);
                }
            })
            ->when(!empty($oDataParams['logistic_id']), function ($query) use ($oDataParams) {
                if ($oDataParams['logistic_id'] != 'ALL') {
                    $query->where('logistic_id', $oDataParams['logistic_id']);
                }
            })
            ->when(!empty($oDataParams['branch_id']), function ($query) use ($oDataParams) {
                $query->where('branch_id', $oDataParams['branch_id']);
            })
            ->when(!empty($oDataParams['request_by']), function ($query) use ($oDataParams) {
                $query->where('created_by', $oDataParams['request_by']);
            })
            ->orderBy('created_at', 'asc');
        $results = $this->applyPaginate($reportQuery);
        // } else {
        //     $results = [
        //         'meta' => [],
        //         'results' => [],
        //     ];
        // }

        $responseData = [
            'meta' => $results['meta'],
            'results' => $results['results'],
        ];
        return $responseData;
    }

    public function getRequisitionAnalyticExport()
    {
        $oDataParams = $this->oDataService->getFilterQueryParams();
        if (!empty($oDataParams['step_code'])) {
            $processStatus = [];
            if ($oDataParams['step_code'] == 'ALL') {
                $filterType = 'ALL';
            } else if ($oDataParams['step_code'] == 'PENDING') {
                $filterType = 'STEP';
                $processStatus = ['PENDING', 'SUBMITTED'];
            } else {
                $filterType = 'STEP';
                $processStatus[] = $oDataParams['step_code'];
            }
        }
        $reportQuery = (new RequisitionRepository())
            ->newQuery()
            ->select('id', 'requisition_number', 'branch_id', 'logistic_id', 'subject', 'process_status', 'created_at', 'created_by')
            ->with([
                // 'stepInfo:id,name',
                'logistic:id,name,code',
                'branch:id,name',
                'createdBy:id,name',
            ])
            ->when($filterType, function ($query) use ($processStatus, $filterType) {
                if ($filterType != 'ALL') {
                    if ($filterType == 'REJECTED') {
                        $query->whereIn('process_status', ['REJECTED']);
                    } else {
                        $query->whereIn('process_status', $processStatus);
                    }
                } else {
                    $query->whereNotIn('process_status', ['DRAFT']);
                }
            })
            ->when(!empty($oDataParams['logistic_id']), function ($query) use ($oDataParams) {
                $query->where('logistic_id', $oDataParams['logistic_id']);
            })
            ->when(!empty($oDataParams['branch_id']), function ($query) use ($oDataParams) {
                $query->where('branch_id', $oDataParams['branch_id']);
            })
            ->when(!empty($oDataParams['request_by']), function ($query) use ($oDataParams) {
                $query->where('created_by', $oDataParams['request_by']);
            })
            ->orderBy('created_at', 'asc');
        $results = $this->applyPaginate($reportQuery);
        // } else {
        //     $results = [
        //         'meta' => [],
        //         'results' => [],
        //     ];
        // }

        $responseData = [
            // 'meta' => $results['meta'],
            'results' => $results['results'],
        ];
        return $responseData;
    }
}
