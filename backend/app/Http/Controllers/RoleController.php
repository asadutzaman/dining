<?php

namespace App\Http\Controllers;

use App\Exceptions\ValidatorException;
use App\Http\Resources\RoleResource;
use App\Repositories\PermissionRepository;
use App\Repositories\RoleRepository;
use App\Traits\Controller\RestControllerTrait;
use App\Validators\RoleValidator;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class RoleController extends Controller
{
    private $repository;

    private $validator;

    private $resource;

    private $partialUpdateFields = ['name', 'status'];

    use RestControllerTrait;

    public function __construct(RoleRepository $repository, RoleValidator $validator)
    {
        $this->repository = $repository;
        $this->validator = $validator;
        $this->resource = RoleResource::class;
    }

    public function duplicateRoleWithPermission(Request $request)
    {
        try {
            $duplicateRoleId = $request->post('duplicate_role_id');

            $this->validate($request, $this->validator->rules(), $this->validator->messages());

            $result =  $this->repository->create($request->all());

            // Clone Permission
            $newRoleId = $result->id;
            $this->clonePermission($duplicateRoleId, $newRoleId);

            $response = isset($this->resource) ? new $this->resource($result) : $result;
            return $this->successResourceResponse($response);
        }
        catch (ValidationException $e) {
            throw new ValidatorException($e);
        }
        catch (\Exception $e) {
            $this->errorResponse($e->getMessage());
        }
    }

    private function clonePermission($duplicateRoleId, $newRoleId)
    {
        $permissionRepository = new PermissionRepository();
        $permissionList = $permissionRepository->getPermissionList($duplicateRoleId);
        foreach ($permissionList as $item) {
            $data = [];
            $data['scope_id'] = $item['scope_id'];
            $data['role_id'] = $newRoleId;
            $data['status'] = $item['status'];
            $permissionRepository->create($data);
        }
    }

}
