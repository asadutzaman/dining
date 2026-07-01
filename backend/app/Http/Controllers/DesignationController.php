<?php

namespace App\Http\Controllers;

use App\Validators\DesignationValidator;
use App\Repositories\DesignationRepository;
use App\Http\Resources\DesignationResource;
use App\Repositories\UserRepository;
use App\Traits\Controller\RestControllerTrait;

class DesignationController extends Controller
{
    private $repository;

    private $validator;

    private $resource;

    private $partialUpdateFields = ['status'];

    use RestControllerTrait;

    public function __construct(DesignationRepository $repository, DesignationValidator $validator)
    {
        $this->repository = $repository;
        $this->validator = $validator;
        $this->resource = DesignationResource::class;
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

            if ((new UserRepository())->exists(['designation_id' => $id])) {
                $this->errorResponse('Designation is used in User');
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
