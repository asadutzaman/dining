<?php

namespace App\Repositories;

use App\Models\WorkflowStepTask;
use App\Services\ODataService;

class WorkflowStepTaskRepository extends BaseRepository
{
    /**
     * @var WorkflowStepTask
     */
    protected $model;

    protected $request;

    protected $oDataService;

    protected $fieldSearchable = ['title', 'description'];

    public function __construct()
    {
        $this->model         = new WorkflowStepTask();
    }
    protected function init()
    {
        $this->request      = request();
        $this->oDataService = (new ODataService())->init();
    }

    public function deleteWorkflowStepTaskByIds($stepId, $ids)
    {
        $query = $this->newQuery();
        $query->where(['workflow_step_id' => $stepId]);

        if (is_array($ids) && count($ids) > 0) {
            $query->whereNotIn('id', $ids);
        }

        return $query->delete();
    }

    public function getWorkflowStepTaskList($workflowStepId, $workflowActionCode)
    {
        return $this->newQuery()
            ->where(['workflow_step_id' => $workflowStepId])
            ->where(['action_code' => $workflowActionCode])
            ->get();
    }
}
