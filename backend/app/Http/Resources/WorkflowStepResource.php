<?php

namespace App\Http\Resources;

use App\Repositories\UserRepository;
use App\Repositories\WorkflowStepActionRepository;
use App\Repositories\WorkflowStepApproverRepository;
use App\Repositories\WorkflowStepPreconditionRepository;
use App\Repositories\WorkflowStepTaskRepository;
use App\Services\ResourceService;

class WorkflowStepResource extends BaseResource
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
                'workflow_id'      => $this->workflow_id,
                'step_key'        => $this->step_key,
                'step_name'       => $this->step_name,
                'step_code'       => $this->step_code,
                'step_type'       => $this->step_type,
                'sort_order'      => $this->sort_order,
                'status'          => $this->status,
            ];

            $includesData = [];
            if ($this->id) {
                $includesData['step_approvers'] = (new WorkflowStepApproverRepository())
                    ->newQuery()
                    ->with([
                        'user:id,name,email,designation_id',
                        'approverGroup:id,name',
                        'user.designation:id,title',
                        'designation:id,title'
                    ])
                    ->where('workflow_step_id', $this->id)
                    ->get()
                    ->map(function ($item) {
                        $item->approver_group_name = $item->approverGroup->name ?? null;
                        $item->approver_group_member_name = $item->user->name ?? null;
                        $item->designation_name = $item->user->designation->title ?? null;
                        // if approver_mode is DESIGNATION, then get all user ids with the same designation_id
                        if ($item->approver_mode === 'DESIGNATION') {
                            $item->designation_name = $item->designation->title ?? null;
                            $item->user_ids = (new UserRepository())->findWhere('designation_id', $item->designation_id)->pluck('id')->toArray() ?? [];
                        }
                        return $item;
                    });
                // ->findWhere('workflow_step_id', $this->id, ['id', 'workflow_step_id', 'approver_group_id', 'user_id', 'approver_type', 'status']);
                $includesData['pre_conditions'] = (new WorkflowStepPreconditionRepository())->findWhere('workflow_step_id', $this->id, ['id', 'workflow_step_id', 'field_name', 'operator', 'field_value']);
                $actionList = (new WorkflowStepActionRepository())->findWhere('workflow_step_id', $this->id, ['id', 'workflow_step_id', 'action_type', 'action_name', 'action_code', 'is_comment_mandatory', 'sort_order', 'status']);
                $includesData['actions'] = ResourceService::getResourceCollection($actionList, WorkflowStepActionResource::class);
                $includesData['tasks'] = (new WorkflowStepTaskRepository())->findWhere('workflow_step_id', $this->id, ['id', 'workflow_step_id', 'action_name', 'action_code', 'task_key', 'task_type', 'field_name', 'field_value']);
            }
            return array_merge($data, $includesData);
        } catch (\Exception $e) {
            return parent::toArray($request);
        }
    }
}
