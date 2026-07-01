<?php

namespace App\Repositories;

use App\Models\WorkflowStepPrecondition;
use App\Services\ODataService;

class WorkflowStepPreconditionRepository extends BaseRepository
{
    /**
     * @var WorkflowStepPrecondition
     */
    protected $model;

    protected $request;

    protected $oDataService;

    protected $fieldSearchable = ['title', 'description'];

    public function __construct()
    {
        $this->model         = new WorkflowStepPrecondition();
    }
    protected function init()
    {
        $this->request      = request();
        $this->oDataService = (new ODataService())->init();
    }

    public function deleteWorkflowStepPreconditionByIds($stepId, $ids)
    {
        $query = $this->newQuery();
        $query->where(['workflow_step_id' => $stepId]);

        if (is_array($ids) && count($ids) > 0) {
            $query->whereNotIn('id', $ids);
        }

        return $query->delete();
    }

    public function getWorkflowStepPreconditionByStepCode($stepCode)
    {
        $stepInfo = (new WorkflowStepRepository())->findBy('step_code', $stepCode);
        return $this->newQuery()
            ->where(['workflow_step_id' => $stepInfo->id])
            ->where('field_name', 'process_status')
            ->pluck('field_value') ?? [];
    }
}
