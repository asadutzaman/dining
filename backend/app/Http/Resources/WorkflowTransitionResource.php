<?php

namespace App\Http\Resources;

class WorkflowTransitionResource extends BaseResource
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
                'id'                          => $this->id,
                'workflow_action_name'         => $this->workflow_action_name,
                'workflow_action_code'         => $this->workflow_action_code,
                'workflow_action_alias_text'   => $this->workflow_action_alias_text,
                'workflow_action_button_color' => $this->workflow_action_button_color,
                'comment'                     => $this->comment,
                'status'                      => $this->status,
                'created_at'                  => $baseData['created_at'],
                'updated_at'                  => $baseData['updated_at'],
                'created_by_name'             => $baseData['created_by_name'],
                'updated_by_name'             => $baseData['updated_by_name'],
            ];

            if ($this->workflow_id) {
                $includesData['workflow_name'] = $this->workflow->workflow_name;
            }
            if ($this->workflow_step_id) {
                $includesData['workflow_step_name'] = $this->workflowStep->step_name;
            }
            return array_merge($data, $includesData);
        } catch (\Exception $e) {
            return parent::toArray($request);
        }
    }
}
