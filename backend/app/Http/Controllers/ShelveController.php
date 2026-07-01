<?php

namespace App\Http\Controllers;

use App\Http\Resources\ShelveResource;
use App\Repositories\ItemStockRepository;
use App\Repositories\ShelveRepository;
use App\Traits\Controller\RestControllerTrait;
use App\Validators\ShelveValidator;

class ShelveController extends Controller
{
    private $repository;

    private $validator;

    private $resource;

    private $partialUpdateFields = ['status'];

    use RestControllerTrait;

    public function __construct(ShelveRepository $repository, ShelveValidator $validator)
    {
        $this->repository = $repository;
        $this->validator = $validator;
        $this->resource = ShelveResource::class;
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

            if ((new ItemStockRepository())->exists(['shelve_id' => $id])) {
                $this->errorResponse('This Shelve is used in Item Stock');
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
