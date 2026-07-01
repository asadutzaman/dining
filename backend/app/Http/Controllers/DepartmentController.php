<?php

namespace App\Http\Controllers;

use App\Validators\DepartmentValidator;
use App\Repositories\DepartmentRepository;
use App\Http\Resources\DepartmentResource;
use App\Repositories\UserRepository;
use App\Traits\Controller\RestControllerTrait;

class DepartmentController extends Controller
{
    private $repository;

    private $validator;

    private $resource;

    private $partialUpdateFields = ['status'];

    use RestControllerTrait;

    public function __construct(DepartmentRepository $repository, DepartmentValidator $validator)
    {
        $this->repository = $repository;
        $this->validator = $validator;
        $this->resource = DepartmentResource::class;
    }

    public function destroy($id)
    {
        try {
            if (!isset($this->repository)) {
                $this->errorResponse('Repository not defined');
            }

            $entity = $this->repository->findById($id);
            if (!$entity) {
                $this->notFoundResponse();
            }

            if ((new UserRepository())->exists(['department_id' => $id])) {
                $this->errorResponse('Department is used in User');
            }

            $response = $this->repository->delete($id);
            if (!$response) {
                $this->errorResponse();
            }
            return $this->deleteResponse();
        } catch (\Exception $e) {
            $this->errorResponse($e->getMessage());
        }
    }
}
