<?php

namespace App\Http\Controllers;

use App\Exceptions\ErrorException;
use App\Exceptions\ValidatorException;
use App\Http\Resources\UserResource;
use App\Repositories\OrganizationRepository;
use App\Repositories\UserRepository;
use App\Repositories\UserSettingRepository;
use App\Repositories\WorkspaceRepository;
use App\Traits\Controller\RestControllerTrait;
use App\Validators\UserSettingValidator;
use App\Validators\UserValidator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{
    private $repository;

    private $userSettingRepository;

    private $workspaceRepository;

    private $organizationRepository;

    private $validator;

    private $userSettingvalidator;

    private $resource;

    private $partialUpdateFields = ['name', 'status'];

    use RestControllerTrait;

    public function __construct(
        UserRepository $repository,
        UserSettingRepository $userSettingRepository,
        WorkspaceRepository $workspaceRepository,
        OrganizationRepository $organizationRepository,
        UserValidator $validator,
        UserSettingValidator $userSettingvalidator
    ) {
        $this->repository = $repository;
        $this->userSettingRepository = $userSettingRepository;
        $this->workspaceRepository = $workspaceRepository;
        $this->organizationRepository = $organizationRepository;
        $this->validator = $validator;
        $this->userSettingvalidator = $userSettingvalidator;
        $this->resource = UserResource::class;
    }

    public function store(Request $request)
    {
        try {
            DB::beginTransaction();

            if (isset($this->validator)) {
                $this->validate($request, $this->validator->rules(), $this->validator->messages());
            }
            $request->request->add(['first_name' => $request->name]);
            $request->request->add(['user_type' => 'SERVICE_PROVIDER']);

            $result =  $this->repository->create([
                'first_name'        => $request->name,
                'name'             => $request->name,
                'email'            => $request->email,
                'phone'            => $request->phone,
                'password'         => empty($request->get('password')) ? '123456' : $request->password,
                'employee_id'      => $request->employee_id,
                'designation_id'   => $request->designation_id,
                'logistic_id'      => $request->logistic_id,
                'branch_id'        => $request->branch_id,
                'department_id'    => $request->department_id,
                'user_type'        => 'SERVICE_PROVIDER',
                'role_ids'         => $request->role_ids,
                'organization_ids' => $request->organization_ids ?? array("1"),
                'organogram_ids'   => $request->organogram_ids ?? array("1"),
            ]);
            $response = isset($this->resource) ? new $this->resource($result) : $result;

            DB::commit();
            return $this->successResponse($response);
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
        try {
            if (isset($this->validator)) {
                $this->validate($request, $this->validator->rules(), $this->validator->messages());
            }
            $request->request->add(['first_name' => $request->name]);

            if (empty($request->get('password'))) {
                $this->repository->update($request->except('password'), $id);
            } else {
                $this->repository->update($request->all(), $id);
            }

            // Get Data
            $result = $this->repository->show($id);
            $response = isset($this->resource) ? new $this->resource($result) : $result;

            return $this->successResourceResponse($response);
        } catch (ValidationException $e) {
            throw new ValidatorException($e);
        } catch (\Exception $e) {
            $this->errorResponse($e->getMessage());
        }
    }

    public function updateUserSetting(Request $request)
    {
        try {
            if (isset($this->userSettingvalidator)) {
                $this->validate($request, $this->userSettingvalidator->rules(), $this->userSettingvalidator->messages());
            }

            $userId = $request->post('user_id');
            $userSettingInfo = $this->userSettingRepository->getUserSetting($userId);
            if (!empty($userSettingInfo)) {
                $response = $this->userSettingRepository->update($request->all(), $userSettingInfo->id);
            } else {
                $response = $this->userSettingRepository->create($request->all());
            }

            return $this->successResponse($response);
        } catch (ValidationException $e) {
            throw new ValidatorException($e);
        } catch (\Exception $e) {
            $this->errorResponse($e->getMessage());
        }
    }

    public function device($id)
    {
        try {
            $result = $this->repository->getByDeviceId($id);
            if (empty($result)) {
                throw new ErrorException('No query results for model [device] ' . $id);
            }
            $response = isset($this->resource) ? new $this->resource($result) : $result;
            return $this->successResourceResponse($response);
        } catch (\Exception $e) {
            $this->errorResponse($e->getMessage());
        }
    }
}
