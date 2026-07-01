<?php

namespace App\Repositories;

use App\Models\WorkflowStepApprover;
use App\Services\ODataService;

class WorkflowStepApproverRepository extends BaseRepository
{
    /**
     * @var WorkflowStepApprover
     */
    protected $model;

    protected $request;

    protected $oDataService;

    protected $fieldSearchable = ['title', 'description'];

    public function __construct()
    {
        $this->model         = new WorkflowStepApprover();
    }
    protected function init()
    {
        $this->request      = request();
        $this->oDataService = (new ODataService())->init();
    }

    public function deleteWorkflowStepApproverByIds($stepId, $ids)
    {
        $query = $this->newQuery();
        $query->where(['workflow_step_id' => $stepId]);

        if (is_array($ids) && count($ids) > 0) {
            $query->whereNotIn('id', $ids);
        }

        return $query->delete();
    }
}
