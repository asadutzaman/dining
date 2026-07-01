<?php

namespace App\Http\Controllers;

use App\Http\Resources\ApproverGroupResource;
use App\Repositories\ApproverGroupMemberRepository;
use App\Repositories\ApproverGroupRepository;
use App\Traits\Controller\RestControllerTrait;
use App\Validators\ApproverGroupValidator;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use App\Exceptions\ValidatorException;
use App\Http\Resources\ApproverGroupMemberResource;
use App\Repositories\RoleRepository;
use App\Repositories\UserRepository;
use App\Repositories\WorkflowStepApproverRepository;
use App\Services\ResourceService;
use Dotenv\Exception\ValidationException;
use Exception;

class ApproverGroupController extends Controller
{
    private $repository;

    private $approverGroupMemberRepository;

    private $validator;

    private $resource;

    private $partialUpdateFields = ['status'];

    use RestControllerTrait;

    public function __construct(ApproverGroupRepository $repository, ApproverGroupValidator $validator, ApproverGroupMemberRepository $approverGroupMemberRepository)
    {
        $this->repository = $repository;
        $this->approverGroupMemberRepository = $approverGroupMemberRepository;
        $this->validator = $validator;
        $this->resource = ApproverGroupResource::class;
    }

    public function store(Request $request)
    {
        DB::beginTransaction();
        try {
            $formData = $request->all();

            if (!isset($this->repository)) {
                $this->errorResponse('Repository not defined');
            }

            if (isset($this->validator)) {
                $this->validate($request, $this->validator->rules(), $this->validator->messages());
            }

            $approverGroupResult =  $this->repository->create($request->all());
            if (empty($approverGroupResult)) {
                throw new Exception("Approver Group save fail!");
            }

            if (!isset($this->approverGroupMemberRepository)) {
                $this->errorResponse('Approver Group Member Repository not defined');
            }

            $approverGroupMemberList = !empty($formData['approverGroupMemberList']) ? $formData['approverGroupMemberList'] : null;
            if ($approverGroupMemberList) {
                foreach ($approverGroupMemberList as $key => $item) {
                    $this->approverGroupMemberRepository->create([
                        'approver_group_id' => $approverGroupResult['id'],
                        'user_id'           => $item['user_id'],
                        'approver_type'     => 'APPROVER',
                    ]);

                    // UPDATE role_ids FIELD IN USER TABLE
                    $this->updateApproverRole($item['user_id'], $request->workflow_code);
                }
            }

            DB::commit();
            $response = isset($this->resource) ? new $this->resource($approverGroupResult) : $approverGroupResult;
            return $this->successResourceResponse($response);
        } catch (ValidationException $e) {
            DB::rollBack();
            throw new ValidatorException($e);
        } catch (\Exception $e) {
            DB::rollBack();
            $this->errorResponse($e->getMessage());
        }
    }

    // make the update function just like store function
    public function update(Request $request, $id)
    {
        DB::beginTransaction();
        try {
            $formData = $request->all();

            if (!isset($this->repository)) {
                $this->errorResponse('Repository not defined');
            }

            if (isset($this->validator)) {
                $this->validate($request, $this->validator->rules(), $this->validator->messages());
            }

            $approverGroupResult =  $this->repository->update($request->all(), $id);
            if (empty($approverGroupResult)) {
                $this->errorResponse("Approver Group save fail!");
            }

            if (!isset($this->approverGroupMemberRepository)) {
                $this->errorResponse('Approver Group Member Repository not defined');
            }

            $approverGroupMemberList = !empty($formData['approverGroupMemberList']) ? $formData['approverGroupMemberList'] : [];

            if ($approverGroupMemberList) {
                // NONMATCH DATA DELETE
                $approverGroupMemberIds = array_column($approverGroupMemberList, 'id');
                $existApproverGroupMemberIds = $this->approverGroupMemberRepository->getApproverGroupMemberIds($id);
                $diffIds = array_diff($existApproverGroupMemberIds, $approverGroupMemberIds);
                // CHECK IF THIS APPROVER GROUP MEMBER IS USED IN WORKFLOW STEP APPROVER
                if (count($diffIds) > 0) {
                    foreach ($diffIds as $key => $memberId) {
                        $deleteMemberInfo = $this->approverGroupMemberRepository->show($memberId);
                        $isUsedInWorkflowStepApprover = (new WorkflowStepApproverRepository())->exists(['approver_group_id' => $id, 'user_id' => $deleteMemberInfo->user_id]);
                        if ($isUsedInWorkflowStepApprover) {
                            $this->errorResponse('This Approver Group Member is used in Workflow Step Approver');
                        }
                    }
                    // REMOVE WORKFLOW role_id from user table
                    $diffUserIds = $this->approverGroupMemberRepository->getUserIdsByMemberIds($diffIds);
                    $this->removeApproverRole($diffUserIds, $request->workflow_code);
                }
                $this->approverGroupMemberRepository->deleteApproverGroupMemberByIds($id, $approverGroupMemberIds);

                foreach ($approverGroupMemberList as $key => $item) {
                    $approverGroupMemberItem = [
                        'approver_group_id' => $id,
                        'user_id'           => $item['user_id'],
                        'approver_type'     => 'APPROVER',
                    ];

                    if (!empty($item['id'])) {
                        // UPDATE OLD ONE
                        $this->approverGroupMemberRepository->update($approverGroupMemberItem, $item['id']);
                    } else {
                        // CREATE NEW ONE
                        $this->approverGroupMemberRepository->create($approverGroupMemberItem);

                        // UPDATE role_ids FIELD IN USER TABLE
                        $this->updateApproverRole($item['user_id'], $request->workflow_code);
                    }
                }
            }

            DB::commit();
            $response = $this->repository->show($id);
            $response = ResourceService::getResources($response, ApproverGroupMemberResource::class);
            return $this->successResourceResponse($response);
        } catch (ValidationException $e) {
            DB::rollBack();
            throw new ValidatorException($e);
        } catch (\Exception $e) {
            DB::rollBack();
            $this->errorResponse($e->getMessage());
        }
    }

    public function memberDropdown(Request $request)
    {
        try {
            if (!isset($this->approverGroupMemberRepository)) {
                $this->errorResponse('Repository not defined');
            }

            $result['results'] = $this->approverGroupMemberRepository->approverGroupMemberList($request->input('approver_group_id'));
            return $result;
            // $response = isset($this->resource) ? $this->resource::collection($result['results']) : $result['results'];
            // return $this->successResourceResponse($response);
        } catch (\Exception $e) {
            $this->errorResponse($e->getMessage());
        }
    }

    public function destroy($id)
    {
        DB::beginTransaction();
        try {
            if (!isset($this->repository)) {
                $this->errorResponse('Repository not defined');
            }

            $entity = $this->repository->findById($id);
            if (!$entity) {
                $this->notFoundResponse();
            }

            // RECORD DELETE CRITERIA
            if ((new WorkflowStepApproverRepository())->exists(['approver_group_id' => $id])) {
                $this->errorResponse('This Approver Group is used in Workflow Step Approver');
            }

            if (!isset($this->approverGroupMemberRepository)) {
                $this->errorResponse('Approver Group Member Repository not defined');
            }

            // REMOVE WORKFLOW role_id from user table
            $existApproverGroupMemberIds = $this->approverGroupMemberRepository->getApproverGroupMemberUserIds($id);
            if (count($existApproverGroupMemberIds) > 0) {
                $this->removeApproverRole($existApproverGroupMemberIds, $entity->workflow_code);
            }
            $this->approverGroupMemberRepository->deleteBy('approver_group_id', $id);

            $response = $this->repository->delete($id);
            if (!$response) {
                $this->errorResponse();
            }
            DB::commit();
            return $this->deleteResponse();
        } catch (\Exception $e) {
            DB::rollBack();
            $this->errorResponse($e->getMessage());
        }
    }

    private function updateApproverRole($userId, $workflowCode)
    {
        // UPDATE role_ids FIELD IN USER TABLE
        $user = (new UserRepository())->findById($userId);
        if ($user) {
            // No need for json_decode - it's already an array due to the cast
            $roleIds = $user->role_ids ?? [];

            // FIND ROLE ID FROM ROLE TABLE BY workflow_code
            $role = (new RoleRepository())->findBy('code', $workflowCode);
            if ($role) {
                $roleIds[] = $role->id;
            }

            // No need for json_encode - the cast handles it automatically
            return (new UserRepository())->update(['role_ids' => $roleIds], $user->id);
        }
    }

    private function removeApproverRole($userIds, $workflowCode)
    {
        // UPDATE role_ids FIELD IN USER TABLE
        foreach ($userIds as $userId) {
            $user = (new UserRepository())->findById($userId);
            if ($user) {
                // Normalize to array regardless of current type
                $roleIds = match (true) {
                    is_array($user->role_ids) => $user->role_ids,
                    is_string($user->role_ids) => json_decode($user->role_ids, true) ?? [],
                    default => []
                };

                // FIND ROLE ID FROM ROLE TABLE BY workflow_code
                $role = (new RoleRepository())->findBy('code', $workflowCode);
                if ($role) {
                    // Remove the role ID and re-index the array
                    $roleIds = array_values(array_diff($roleIds, [$role->id]));
                }

                // Update the user - removed 'return' to continue the loop
                (new UserRepository())->update(['role_ids' => $roleIds], $user->id);
            }
        }
    }
}
