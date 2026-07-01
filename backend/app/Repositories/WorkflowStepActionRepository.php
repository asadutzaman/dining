<?php

namespace App\Repositories;

use App\Models\WorkflowStepAction;
use App\Services\ODataService;

class WorkflowStepActionRepository extends BaseRepository
{
    /**
     * @var WorkflowStepAction
     */
    protected $model;

    protected $request;

    protected $oDataService;

    protected $fieldSearchable = ['title', 'description'];

    public function __construct()
    {
        $this->model         = new WorkflowStepAction();
    }
    protected function init()
    {
        $this->request      = request();
        $this->oDataService = (new ODataService())->init();
    }

    public function deleteWorkflowStepActionByIds($stepId, $ids)
    {
        $query = $this->newQuery();
        $query->where(['workflow_step_id' => $stepId]);

        if (is_array($ids) && count($ids) > 0) {
            $query->whereNotIn('id', $ids);
        }

        return $query->delete();
    }
}
