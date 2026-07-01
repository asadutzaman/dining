<?php

namespace App\Http\Controllers;

use App\Events\WorkflowTaskEvent;
use Illuminate\Http\Request;
use App\Exceptions\ValidatorException;
use Illuminate\Validation\ValidationException;
use App\Http\Resources\WorkflowTransitionResource;
use App\Repositories\WorkflowRepository;
use App\Repositories\WorkflowTransitionAssignmentRepository;
use App\Repositories\WorkflowTransitionRepository;
use App\Traits\Controller\RestControllerTrait;
use App\Validators\WorkflowTransitionValidator;
use Illuminate\Support\Facades\DB;

class WorkflowTransitionController extends Controller
{
    private $repository;

    private $validator;

    private $resource;

    private $partialUpdateFields = ['status'];

    use RestControllerTrait;

    public function __construct(WorkflowTransitionRepository $repository, WorkflowTransitionValidator $validator)
    {
        $this->repository = $repository;
        $this->validator = $validator;
        $this->resource = WorkflowTransitionResource::class;
    }

    public function store(Request $request)
    {
        DB::beginTransaction();
        try {
            if (!isset($this->repository)) {
                $this->errorResponse('Repository not defined');
            }

            if (isset($this->validator)) {
                $this->validate($request, $this->validator->rules(), $this->validator->messages());
            }

            $formData = [
                'workflow_id'                  => $request->workflow_id,
                'workflow_step_id'             => $request->workflow_step_id,
                'workflow_record_id'           => $request->workflow_record_id,
                'workflow_action_name'         => $request->workflow_action_name,
                'workflow_action_code'         => $request->workflow_action_code,
                'workflow_action_alias_text'   => $request->workflow_action_alias_text,
                'workflow_action_button_color' => $request->workflow_action_button_color,
                'comment'                     => $request->comment,
                'to_do_data'                  => $request->to_do_data
            ];
            $assignees = $request->assignees ?? [];

            // CHECK: USER HAS PERMISSION TO ACTION THIS STEP

            if ($this->isSamePreviousWorkflowTransitionStatus($formData)) {
                $this->errorResponse("This record is already $request->workflow_action_name");
            }

            $result =  $this->repository->create([
                'workflow_id'                  => $request->workflow_id,
                'workflow_step_id'             => $request->workflow_step_id,
                'workflow_record_id'           => $request->workflow_record_id,
                'workflow_action_name'         => $request->workflow_action_name,
                'workflow_action_code'         => $request->workflow_action_code,
                'workflow_action_alias_text'   => $request->workflow_action_alias_text,
                'workflow_action_button_color' => $request->workflow_action_button_color,
                'comment'                     => $request->comment
            ]);

            if (count($assignees) > 0) {
                $workflowTransitionAssignmentRepository = new WorkflowTransitionAssignmentRepository();
                $workflowInfo = (new WorkflowRepository())->findById($request->workflow_id, ['id', 'workflow_code', 'type']);
                $workflowRecordFrom = null;
                if ($workflowInfo->type == 'Requisition') {
                    $workflowRecordFrom = 'App\Models\Requisition';
                }
                foreach ($assignees as $key => $assignee) {
                    $approverData = [
                        'workflow_id'             => $request->workflow_id,
                        'workflow_step_id'        => $request->workflow_step_id + 1,
                        'workflow_record_id'      => $request->workflow_record_id,
                        'workflow_record_from'    => $workflowRecordFrom,
                        'workflow_transition_id'  => $result->id,
                        'assigned_to'            => $assignee,
                        'assigned_by'            => $result->created_by,
                    ];
                    $workflowTransitionAssignmentRepository->create($approverData);
                }
            }

            event(new WorkflowTaskEvent($formData));
            DB::commit();
            $response = isset($this->resource) ? new $this->resource($result, false) : $result;
            return $this->successResourceResponse($response);
        } catch (ValidationException $e) {
            DB::rollback();
            throw new ValidatorException($e);
        } catch (\Exception $e) {
            DB::rollback();
            $this->errorResponse($e->getMessage());
        }
    }

    private function isSamePreviousWorkflowTransitionStatus($data)
    {
        $previousWorkflowTransitionInfo = $this->repository->getLastWorkflowTransitionInfo($data['workflow_record_id'], $data['workflow_id']);
        $previousWorkflowActionName = $previousWorkflowTransitionInfo->workflow_action_name ?? null;
        $previousWorkflowActionAliasText = $previousWorkflowTransitionInfo->workflow_action_alias_text ?? null;
        $previousWorkflowActionCode = $previousWorkflowTransitionInfo->workflow_action_code ?? null;

        $workflowActionName = $data['workflow_action_name'];
        $workflowActionCode = $data['workflow_action_code'];
        $workflowActionAliasText = $data['workflow_action_alias_text'];
        if ($previousWorkflowActionName == $workflowActionName && $workflowActionAliasText == $previousWorkflowActionAliasText && $workflowActionCode == $previousWorkflowActionCode) {
            return true;
        } else {
            return false;
        }
    }
}
