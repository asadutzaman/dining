<?php

namespace App\Http\Resources;

use App\Repositories\WorkflowStepActionRuleRepository;

class WorkflowStepActionResource extends BaseResource
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

            $includesData = [];
            $data = [
                'id'                   => $this->id,
                'workflow_step_id'      => $this->workflow_step_id,
                'action_type'          => $this->action_type,
                'action_name'          => $this->action_name,
                'action_code'          => $this->action_code,
                'sort_order'           => $this->sort_order,
                'is_comment_mandatory' => $this->is_comment_mandatory,
                'status'               => $this->status,
            ];
            if ($this->id) {
                $includesData['action_rules'] = (new WorkflowStepActionRuleRepository())->findWhere('workflow_action_id', $this->id, ['id', 'workflow_action_id', 'rule_type', 'operator', 'value', 'status']);
            }
            return array_merge($data, $includesData);
        } catch (\Exception $e) {
            return parent::toArray($request);
        }
    }
}
