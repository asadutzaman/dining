<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Exceptions\ValidatorException;
use Illuminate\Validation\ValidationException;
use App\Http\Resources\WorkflowStepResource;
use App\Repositories\ApproverGroupMemberRepository;
use App\Repositories\WorkflowStepActionRepository;
use App\Repositories\WorkflowStepActionRuleRepository;
use App\Repositories\WorkflowStepApproverRepository;
use App\Repositories\WorkflowStepPreconditionRepository;
use App\Repositories\WorkflowStepRepository;
use App\Repositories\WorkflowStepTaskRepository;
use App\Traits\Controller\RestControllerTrait;
use App\Validators\WorkflowStepValidator;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class WorkflowStepController extends Controller
{
    private $repository;

    private $workflowStepPreconditionRepository;

    private $workflowStepApproverRepository;

    private $workflowStepActionRepository;

    private $workflowStepActionRuleRepository;

    private $workflowStepTaskRepository;

    private $workflowStepTaskRecipientRepository;

    private $validator;

    private $resource;

    private $partialUpdateFields = ['status'];

    use RestControllerTrait;

    public function __construct(
        WorkflowStepRepository $repository,
        WorkflowStepPreconditionRepository $workflowStepPreconditionRepository,
        WorkflowStepApproverRepository $workflowStepApproverRepository,
        WorkflowStepActionRepository $workflowStepActionRepository,
        WorkflowStepActionRuleRepository $workflowStepActionRuleRepository,
        WorkflowStepTaskRepository $workflowStepTaskRepository,
        // WorkflowStepTaskRecipientRepository $workflowStepTaskRecipientRepository,
        WorkflowStepValidator $validator
    ) {
        $this->repository = $repository;
        $this->workflowStepPreconditionRepository = $workflowStepPreconditionRepository;
        $this->workflowStepApproverRepository = $workflowStepApproverRepository;
        $this->workflowStepActionRepository = $workflowStepActionRepository;
        $this->workflowStepActionRuleRepository = $workflowStepActionRuleRepository;
        $this->workflowStepTaskRepository = $workflowStepTaskRepository;
        // $this->workflowStepTaskRecipientRepository = $workflowStepTaskRecipientRepository;
        $this->validator = $validator;
        $this->resource = WorkflowStepResource::class;
    }

    public function store(Request $request)
    {
        /**
         * STEP-1: CREATE WORKFLOW STEP
         * STEP-2: CREATE WORKFLOW STEP PRECONDITIONS
         * STEP-3: CREATE WORKFLOW STEP APPROVERS
         * STEP-4: CREATE WORKFLOW STEP ACTIONS AND ACTION RULES
         * STEP-5: CREATE WORKFLOW STEP TASKS
         */
        DB::beginTransaction();
        try {
            $items                  = $request->all();
            $workflowStep           = Arr::get($items, 'workflowStep', null);
            $workflowStepPrecondition  = Arr::get($items, 'workflowStepPrecondition', null);
            $workflowStepApprover   = Arr::get($items, 'workflowStepApprover', null);
            $workflowStepAction     = Arr::get($items, 'workflowStepAction', null);
            $workflowStepTask       = Arr::get($items, 'workflowStepTask', null);

            if (!$workflowStep) {
                throw new \Exception('Workflow step data is empty');
            }

            // STEP-1: CREATE WORKFLOW STEP
            $workflowStepResult =  $this->repository->create([
                'workflow_id'  => $workflowStep['workflow_id'],
                'step_key'    => "Step-{$workflowStep['sort_order']}",
                'step_name'   => $workflowStep['step_name'],
                'step_code'   => strtoupper(str_replace(' ', '_', $workflowStep['step_name'])),
                'step_type'   => $workflowStep['step_type'],
                'sort_order'  => $workflowStep['sort_order']
            ]);
            $workflowStepId = $workflowStepResult->id;

            if (!$workflowStepId) {
                throw new \Exception('Workflow step not saving');
            }

            // STEP-2: CREATE WORKFLOW STEP PRECONDITIONS
            if ($workflowStepPrecondition) {
                foreach ($workflowStepPrecondition as $key => $item) {
                    $workflowStepPreconditionData = [
                        'workflow_id'      => $workflowStep['workflow_id'],
                        'workflow_step_id' => $workflowStepId,
                        'field_name'       => $item['field_name'],
                        'operator'        => $item['operator'],
                        'field_value'      => $item['field_value'],
                        'sort_order'      => ++$key
                    ];
                    $this->workflowStepPreconditionRepository->create($workflowStepPreconditionData);
                }
            }

            // STEP-3: CREATE WORKFLOW STEP APPROVERS
            if ($workflowStepApprover) {
                foreach ($workflowStepApprover as $key => $item) {
                    if ($item['approver_mode'] == 'DESIGNATION') {
                        $approverGroupId = null;
                        $approverGroupMemberId = null;
                        $userId = null;
                        $designationId = $item['designation_id'];
                    } else if ($item['approver_mode'] == 'USER') {
                        $approverGroupId = $item['approver_group_id'];
                        $approverGroupMemberId = $item['approver_group_member_id'];
                        $userId = (new ApproverGroupMemberRepository())->findById($approverGroupMemberId)->user_id ?? null;
                        $designationId = null;
                    }
                    $workflowStepApproverData = [
                        'workflow_id'              => $workflowStep['workflow_id'],
                        'workflow_step_id'         => $workflowStepId,
                        'approver_mode'            => $item['approver_mode'],
                        'designation_id'           => $designationId,
                        'approver_group_id'        => $approverGroupId,
                        'approver_group_member_id' => $approverGroupMemberId,
                        'user_id'                  => $userId,
                        'approver_type'            => $item['approver_type'],
                        'max_step_backward'        => $item['max_step_backward'] ?? 1, // 1 step
                        'max_step_forward'         => $item['max_step_forward'] ?? 1, // 1 step
                        'assign_approver'          => $item['assign_approver'] ?? 0, // false
                        'sort_order'               => $item['sort_order'],
                    ];
                    $workflowStepApproverData['workflow_step_id'] = $workflowStepId;
                    $this->workflowStepApproverRepository->create($workflowStepApproverData);
                }
            }

            // STEP-4: CREATE WORKFLOW STEP ACTIONS AND ACTION RULES
            if ($workflowStepAction) {
                foreach ($workflowStepAction as $item) {
                    $actionCode = strtoupper(str_replace(' ', '_', $item['action_name']));
                    $workflowStepActionData = [
                        'workflow_id'           => $workflowStep['workflow_id'],
                        'workflow_step_id'      => $workflowStepId,
                        'action_type'          => $actionCode == 'REVISE' ? 'CUSTOM' : 'APPROVAL',
                        'action_name'          => $item['action_name'],
                        'action_code'          => $actionCode,
                        'is_comment_mandatory' => $item['is_comment_mandatory'],
                        'sort_order'           => $item['sort_order'],
                    ];
                    $workflowStepActionResult = $this->workflowStepActionRepository->create($workflowStepActionData);
                    $workflowStepActionId = $workflowStepActionResult->id;

                    if (array_key_exists('action_rules', $item) && count($item['action_rules'])) {
                        foreach ($item['action_rules'] as $ruleItem) {
                            $workflowStepActionRuleData = $ruleItem;
                            $workflowStepActionRuleData['workflow_step_id'] = $workflowStepId;
                            $workflowStepActionRuleData['workflow_action_id'] = $workflowStepActionId;
                            $this->workflowStepActionRuleRepository->create($workflowStepActionRuleData);
                        }
                    }
                }
            }

            // STEP-5: CREATE WORKFLOW STEP TASKS
            if ($workflowStepTask) {
                foreach ($workflowStepTask as $item) {
                    $workflowStepTaskData = [
                        'workflow_id'      => $workflowStep['workflow_id'],
                        'workflow_step_id' => $workflowStepId,
                        'action_name'      => $item['action_name'],
                        'action_code'      => $item['action_code'],
                        'task_key'         => $item['task_key'],
                        'task_type'        => $item['task_type'],
                        'field_name'       => $item['field_name'],
                        'field_value'      => $item['field_value'],
                    ];
                    $this->workflowStepTaskRepository->create($workflowStepTaskData);
                }
            }

            DB::commit();
            return $this->successResponse($workflowStepResult);
        } catch (ValidationException $e) {
            DB::rollBack();
            throw new ValidatorException($e);
        } catch (\Exception $e) {
            DB::rollBack();
            $this->errorResponse($e->getMessage());
        }
    }

    public function update(Request $request, $id)
    {
        /**
         * STEP-1: UPDATE WORKFLOW STEP
         * STEP-2: UPDATE WORKFLOW STEP PRECONDITIONS
         * STEP-3: UPDATE WORKFLOW STEP APPROVERS
         * STEP-4: UPDATE WORKFLOW STEP ACTIONS AND ACTION RULES
         * STEP-5: UPDATE WORKFLOW STEP TASKS
         */
        DB::beginTransaction();
        try {
            $items                  = $request->all();
            $workflowStep           = Arr::get($items, 'workflowStep', null);
            $workflowStepPrecondition  = Arr::get($items, 'workflowStepPrecondition', null);
            $workflowStepApprover   = Arr::get($items, 'workflowStepApprover', null);
            $workflowStepAction     = Arr::get($items, 'workflowStepAction', null);
            $workflowStepActionRule = Arr::get($items, 'workflowStepActionRule', null);
            $workflowStepTask       = Arr::get($items, 'workflowStepTask', null);

            if (!$workflowStep) {
                throw new \Exception('Workflow step data is empty');
            }

            $workflowStepInfo = $this->repository->findById($id);

            // STEP-1: UPDATE WORKFLOW STEP
            $workflowStepResult =  $this->repository->update([
                'step_key'   => "Step-{$workflowStep['sort_order']}",
                'step_name'  => $workflowStep['step_name'],
                'step_code'  => strtoupper(str_replace(' ', '_', $workflowStep['step_name'])),
                'step_type'  => $workflowStep['step_type'],
                'sort_order' => $workflowStep['sort_order']
            ], $id);

            // STEP-2: UPDATE WORKFLOW STEP PRECONDITIONS
            if ($workflowStepPrecondition) {
                $workflowStepPreconditionIds = array_column($workflowStepPrecondition, 'id');
                $this->workflowStepPreconditionRepository->deleteWorkflowStepPreconditionByIds($id, $workflowStepPreconditionIds);

                foreach ($workflowStepPrecondition as $key => $item) {
                    $workflowStepPreconditionData = [
                        'field_name'  => $item['field_name'],
                        'operator'   => $item['operator'],
                        'field_value' => $item['field_value'],
                        'sort_order' => ++$key
                    ];
                    if (!empty($item['id'])) {
                        $this->workflowStepPreconditionRepository->update($workflowStepPreconditionData, $item['id']);
                    } else {
                        $workflowStepPreconditionData['workflow_id'] = $workflowStepInfo->workflow_id;
                        $workflowStepPreconditionData['workflow_step_id'] = $id;
                        $this->workflowStepPreconditionRepository->create($workflowStepPreconditionData);
                    }
                }
            } else {
                $this->workflowStepPreconditionRepository->deleteWorkflowStepPreconditionByIds($id, null);
            }

            // STEP-3: UPDATE WORKFLOW STEP APPROVERS
            if ($workflowStepApprover) {
                $workflowStepApproverIds = array_column($workflowStepApprover, 'id');
                $this->workflowStepApproverRepository->deleteWorkflowStepApproverByIds($id, $workflowStepApproverIds);

                foreach ($workflowStepApprover as $key => $item) {
                    if ($item['approver_mode'] == 'DESIGNATION') {
                        $approverGroupId = null;
                        $approverGroupMemberId = null;
                        $userId = null;
                        $designationId = $item['designation_id'];
                    } else if ($item['approver_mode'] == 'USER') {
                        $approverGroupId = $item['approver_group_id'];
                        $approverGroupMemberId = $item['approver_group_member_id'];
                        $userId = (new ApproverGroupMemberRepository())->findById($approverGroupMemberId)->user_id ?? null;
                        $designationId = null;
                    }
                    $workflowStepApproverData = [
                        'approver_mode'            => $item['approver_mode'],
                        'designation_id'           => $designationId,
                        'approver_group_id'        => $approverGroupId,
                        'approver_group_member_id' => $approverGroupMemberId,
                        'user_id'                  => $userId,
                        'approver_type'            => $item['approver_type'],
                        'max_step_backward'        => $item['max_step_backward'] ?? 1, // 1 step
                        'max_step_forward'         => $item['max_step_forward'] ?? 1, // 1 step
                        'assign_approver'          => $item['assign_approver'] ?? 0, // false
                        'sort_order'               => $item['sort_order'],
                    ];

                    if (!empty($item['id'])) {
                        $this->workflowStepApproverRepository->update($workflowStepApproverData, $item['id']);
                    } else {
                        $workflowStepApproverData['workflow_id'] = $workflowStepInfo->workflow_id;
                        $workflowStepApproverData['workflow_step_id'] = $id;
                        $this->workflowStepApproverRepository->create($workflowStepApproverData);
                    }
                }
            } else {
                $this->workflowStepApproverRepository->deleteWorkflowStepApproverByIds($id, null);
            }

            // STEP-4: UPDATE WORKFLOW STEP ACTIONS AND ACTION RULES
            if ($workflowStepAction) {
                $workflowStepActionIds = array_column($workflowStepAction, 'id');
                $this->workflowStepActionRepository->deleteWorkflowStepActionByIds($id, $workflowStepActionIds);

                foreach ($workflowStepAction as $actionItem) {
                    $actionCode = strtoupper(str_replace(' ', '_', $actionItem['action_name']));
                    $workflowStepActionData = [
                        'action_type'          => $actionCode == 'REVISE' ? 'CUSTOM' : 'APPROVAL',
                        'action_name'          => $actionItem['action_name'],
                        'action_code'          => $actionCode,
                        'is_comment_mandatory' => $actionItem['is_comment_mandatory'],
                        'sort_order'           => $actionItem['sort_order'],
                    ];
                    if (!empty($actionItem['id'])) {
                        $actionId = $actionItem['id'];
                        $this->workflowStepActionRepository->update($workflowStepActionData, $actionItem['id']);
                    } else {
                        $workflowStepActionData['workflow_id'] = $workflowStepInfo->workflow_id;
                        $workflowStepActionData['workflow_step_id'] = $id;
                        $workflowStepActionRepositoryResult = $this->workflowStepActionRepository->create($workflowStepActionData);
                        $actionId = $workflowStepActionRepositoryResult->id;
                    }

                    if (array_key_exists('action_rules', $actionItem) && count($actionItem['action_rules']) > 0) {
                        $workflowStepActionRule = $actionItem['action_rules'];
                        $workflowStepActionRuleIds = array_column($workflowStepActionRule, 'id');
                        $this->workflowStepActionRuleRepository->deleteWorkflowStepActionRuleByIds($id, $actionId, $workflowStepActionRuleIds);

                        foreach ($workflowStepActionRule as $ruleItem) {
                            $workflowStepActionRuleData = $ruleItem;
                            if (!empty($ruleItem['id'])) {
                                $this->workflowStepActionRuleRepository->update($workflowStepActionRuleData, $ruleItem['id']);
                            } else {
                                $workflowStepActionRuleData['workflow_step_id'] = $id;
                                $workflowStepActionRuleData['workflow_action_id'] = $actionId;
                                $this->workflowStepActionRuleRepository->create($workflowStepActionRuleData);
                            }
                        }
                    } else {
                        $this->workflowStepActionRuleRepository->deleteWorkflowStepActionRuleByIds($id, $actionId, null);
                    }
                }
            } else {
                $this->workflowStepActionRepository->deleteWorkflowStepActionByIds($id, null);
            }

            // STEP-5: UPDATE WORKFLOW STEP TASKS
            if ($workflowStepTask) {
                $workflowStepTaskIds = array_column($workflowStepTask, 'id');
                $this->workflowStepTaskRepository->deleteWorkflowStepTaskByIds($id, $workflowStepTaskIds);

                foreach ($workflowStepTask as $item) {
                    $workflowStepTaskData = [
                        'action_name'      => $item['action_name'],
                        'action_code'      => $item['action_code'],
                        'task_key'         => $item['task_key'],
                        'task_type'        => $item['task_type'],
                        'field_name'       => $item['field_name'],
                        'field_value'      => $item['field_value'],
                    ];
                    if (!empty($item['id'])) {
                        $this->workflowStepTaskRepository->update($workflowStepTaskData, $item['id']);
                    } else {
                        $workflowStepTaskData['workflow_id'] = $workflowStepInfo->workflow_id;
                        $workflowStepTaskData['workflow_step_id'] = $id;
                        $this->workflowStepTaskRepository->create($workflowStepTaskData);
                    }
                }
            } else {
                $this->workflowStepTaskRepository->deleteWorkflowStepTaskByIds($id, null);
            }

            DB::commit();
            return $this->successResponse($workflowStepResult);
        } catch (ValidationException $e) {
            DB::rollBack();
            throw new ValidatorException($e);
        } catch (\Exception $e) {
            DB::rollBack();
            $this->errorResponse($e->getMessage());
        }
    }
}
