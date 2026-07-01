<?php

namespace App\Repositories;

use App\Models\WorkflowStepActionRule;
use App\Services\ODataService;

class WorkflowStepActionRuleRepository extends BaseRepository
{
    /**
     * @var WorkflowStepActionRule
     */
    protected $model;

    protected $request;

    protected $oDataService;

    protected $fieldSearchable = ['title', 'description'];

    public function __construct()
    {
        $this->model         = new WorkflowStepActionRule();
    }
    protected function init()
    {
        $this->request      = request();
        $this->oDataService = (new ODataService())->init();
    }

    public function deleteWorkflowStepActionRuleByIds($stepId, $actionId, $ids)
    {
        $query = $this->newQuery();
        $query->where(['workflow_step_id' => $stepId]);
        $query->where('workflow_action_id', $actionId);

        if (is_array($ids) && count($ids) > 0) {
            $query->whereNotIn('id', $ids);
        }

        return $query->delete();
    }
}
