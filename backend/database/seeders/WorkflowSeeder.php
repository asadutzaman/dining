<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\Workflow;
use App\Models\WorkflowStep;
use App\Models\WorkflowStepAction;
use App\Models\WorkflowStepActionRule;
use App\Models\WorkflowStepApprover;
use App\Models\WorkflowStepPrecondition;
use App\Models\WorkflowStepTask;
use Database\Seeders\Traits\TruncateTable;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class WorkflowSeeder extends Seeder
{
    use TruncateTable;
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::transaction(function () {
            $this->truncateMultiple([
                'workflows',
                'workflow_steps',
                'workflow_step_actions',
                'workflow_step_approvers',
                'workflow_step_preconditions',
                'workflow_step_tasks',
                'workflow_step_action_rules'
            ]);

            $json = File::get(database_path('seeders/json/workflowsSeeder.json'));
            $workflows = json_decode($json);

            foreach ($workflows as $workflowData) {
                $workflow = Workflow::create([
                    'workflow_name' => $workflowData->workflow_name,
                    'workflow_code' => $workflowData->workflow_code,
                    'type'         => $workflowData->type,
                ]);

                foreach ($workflowData->steps as $stepData) {
                    $workflowStep = WorkflowStep::create([
                        'workflow_id' => $workflow->id,
                        'step_key'   => $stepData->step_key,
                        'step_name'  => $stepData->step_name,
                        'step_code'  => $stepData->step_code,
                        'step_type'  => $stepData->step_type,
                        'sort_order' => $stepData->sort_order,
                    ]);

                    if (isset($stepData->preconditions)) {
                        foreach ($stepData->preconditions as $preconditionData) {
                            WorkflowStepPrecondition::create([
                                'workflow_id'      => $workflow->id,
                                'workflow_step_id' => $workflowStep->id,
                                'field_name'       => $preconditionData->field_name,
                                'operator'        => $preconditionData->operator,
                                'field_value'      => $preconditionData->field_value,
                            ]);
                        }
                    }

                    if (isset($stepData->actions)) {
                        foreach ($stepData->actions as $actionData) {
                            $workflowStepAction = WorkflowStepAction::create([
                                'workflow_id'           => $workflow->id,
                                'workflow_step_id'      => $workflowStep->id,
                                'action_type'          => $actionData->action_type,
                                'action_name'          => $actionData->action_name,
                                'action_code'          => $actionData->action_code,
                                'is_comment_mandatory' => $actionData->is_comment_mandatory,
                                'sort_order'           => $actionData->sort_order,
                            ]);
                            if (isset($actionData->rules)) {
                                foreach ($actionData->rules as $rule) {
                                    WorkflowStepActionRule::create([
                                        'workflow_step_id'    => $workflowStep->id,
                                        'workflow_action_id'  => $workflowStepAction->id,
                                        'rule_type'          => $rule->rule_type,
                                        'operator'           => $rule->operator,
                                        'value'              => $rule->value,
                                    ]);
                                }
                            }
                        }
                    }

                    if (isset($stepData->tasks)) {
                        foreach ($stepData->tasks as $taskData) {
                            WorkflowStepTask::create([
                                'workflow_id'      => $workflow->id,
                                'workflow_step_id' => $workflowStep->id,
                                'action_name'     => $taskData->action_name,
                                'action_code'     => $taskData->action_code,
                                'task_key'        => $taskData->task_key,
                                'task_type'       => $taskData->task_type,
                                'field_name'       => $taskData->field_name,
                                'field_value'      => $taskData->field_value,
                            ]);
                        }
                    }

                    if (isset($stepData->approvers)) {
                        foreach ($stepData->approvers as $approverData) {
                            WorkflowStepApprover::create([
                                'workflow_id'               => $workflow->id,
                                'workflow_step_id'          => $workflowStep->id,
                                'approver_group_id'        => $approverData->approver_group_id,
                                'approver_group_member_id' => $approverData->approver_group_member_id,
                                'user_id'                  => $approverData->user_id,
                                'approver_type'            => $approverData->approver_type,
                                'sort_order'               => $approverData->sort_order,
                            ]);
                        }
                    }
                }

                // FIND ROLE BY workflow_code, IF EXIST THEN SKIP
                $workflowRole = Role::where('code', $workflow->workflow_code)->first();
                if (empty($workflowRole)) {
                    // CREATE ROLE FOR WORKFLOW
                    Role::create([
                        'code'          => $workflow->workflow_code,
                        'name'          => $workflow->workflow_name,
                        'organogram_id' => $workflow->organogram_id,
                    ]);
                }
            }
        });
    }
}
