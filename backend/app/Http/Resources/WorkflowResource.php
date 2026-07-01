<?php

namespace App\Http\Resources;

use App\Repositories\WorkflowStepRepository;
use App\Services\ResourceService;
use Illuminate\Support\Facades\Log;

class WorkflowResource extends BaseResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        try {
            $baseData = parent::toArray($request);

            $data = [
                'id'              => $this->id,
                'workflow_code'    => $this->workflow_code,
                'workflow_name'    => $this->workflow_name,
                'type'            => $this->type,
                'status'          => $this->status,
                'created_by_name' => $baseData['created_by_name'],
                'updated_by_name' => $baseData['updated_by_name'],
            ];
            $includesData = [];
            if ($this->id) {
                $workflowStepList = (new WorkflowStepRepository())->findWhere('workflow_id', $this->id, ['id', 'workflow_id', 'step_key', 'step_name', 'step_code', 'step_type', 'status']);
                $workflowStepListResource = ResourceService::getResourceCollection($workflowStepList, WorkflowStepResource::class);
                $includesData['workflow_steps'] = $workflowStepListResource;
                $includesData['total_steps'] = count($workflowStepList) ?? null;
            }
            return array_merge($data, $includesData);
        } catch (\Exception $e) {
            return parent::toArray($request);
        }
    }
}
