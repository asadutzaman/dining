<?php

namespace App\Repositories;

use App\Models\WorkflowTransition;
use App\Services\ODataService;

class WorkflowTransitionRepository extends BaseRepository
{
    /**
     * @var WorkflowTransition
     */
    protected $model;

    protected $request;

    protected $oDataService;

    protected $fieldSearchable = ['title', 'description'];

    public function __construct()
    {
        $this->model         = new WorkflowTransition();
    }
    protected function init()
    {
        $this->request      = request();
        $this->oDataService = (new ODataService())->init();
    }

    public function getLastWorkflowTransitionInfo($workflowRecordId, $workflowId)
    {
        return $this->newQuery()
            ->where('workflow_record_id', $workflowRecordId)
            ->where('workflow_id', $workflowId)
            ->orderBy('id', 'desc')
            ->first();
    }
}
