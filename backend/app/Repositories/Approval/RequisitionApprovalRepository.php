<?php

namespace App\Repositories\Approval;

use App\Models\Requisition;
use App\Models\WorkflowTransitionAssignment;
use App\Repositories\BaseRepository;
use App\Repositories\BranchRepository;
use App\Services\ODataService;
use App\Services\SessionService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Log;

class RequisitionApprovalRepository extends BaseRepository
{
    /**
     * @var Requisition
     */
    protected $model;

    protected $request;

    protected $oDataService;

    protected $fieldSearchable = ['subject', 'description'];

    public function __construct()
    {
        $this->model         = new Requisition();
    }
    protected function init()
    {
        $this->request      = request();
        $this->oDataService = (new ODataService())->init();
    }

    protected function applyFilters(Builder $query, array $filters = []): Builder
    {
        // organogram wise / branch wise user access
        // Get my accessible branch ids including child branches (own & child branches)
        $branchId = (new SessionService())->init()->getUserBranchId();
        $branchIds = (new BranchRepository())->getBranchChildIds($branchId);
        $branchIds[] = $branchId;
        Log::info($branchIds);

        $query = parent::applyFilters($query, $filters);
        $oDataParams = $this->oDataService->getQueryParams($this->request);
        // Log::info('OData Query Params: ', array($oDataParams['$queryParams']['workflow_step']));

        $workflowStepId = $oDataParams['$queryParams']['workflow_step'] ?? null;
        if (!$workflowStepId || $branchId == null) {
            return $query->whereRaw('1 = 0');
        }
        $assignedOwnRecordIds = (new WorkflowTransitionAssignment())
            ->newQuery()
            ->where('workflow_id', 1) // MAKE QUERY FOR GET PARTICULAR WORKFLOW ID
            ->where('workflow_step_id', $workflowStepId)
            ->where('assigned_to', (new SessionService())->init()->getUserId())
            ->pluck('workflow_record_id')
            ->toArray();

        $assignedAllRecordIds = (new WorkflowTransitionAssignment())
            ->newQuery()
            ->where('workflow_id', 1) // MAKE QUERY FOR GET PARTICULAR WORKFLOW ID
            ->where('workflow_step_id', $workflowStepId)
            ->pluck('workflow_record_id')
            ->toArray();

        $query->where(function ($q) use ($workflowStepId, $branchIds) {
            if ($workflowStepId == 1) { // NO NEED TO PROPER ORGANOGRAM (Bangla Trac GROUP) because of designation level (supervisor hasn't a supervisor)
                $q->whereIn('branch_id', $branchIds); // Records assigned to my branch or child branches
            }
        });

        // Get records that are either assigned to me OR not assigned to anyone
        $query->where(function ($q) use ($assignedOwnRecordIds, $assignedAllRecordIds, $branchIds) {
            $q->whereIn('id', $assignedOwnRecordIds) // Records assigned to me
                ->orWhereNotIn('id', $assignedAllRecordIds); // Records not assigned to anyone
        });

        return $query;
    }
}
