<?php

namespace App\Http\Controllers;

use App\Http\Resources\LogisticResource;
use App\Repositories\ItemRepository;
use App\Repositories\LogisticRepository;
use App\Traits\Controller\RestControllerTrait;
use App\Validators\LogisticValidator;

class LogisticController extends Controller
{
    private $repository;

    private $validator;

    private $resource;

    private $partialUpdateFields = ['status'];

    use RestControllerTrait;

    public function __construct(LogisticRepository $repository, LogisticValidator $validator)
    {
        $this->repository = $repository;
        $this->validator = $validator;
        $this->resource = LogisticResource::class;
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

            if ((new ItemRepository())->exists(['logistic_id' => $id])) {
                $this->errorResponse('This Logistic is used in Item');
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
