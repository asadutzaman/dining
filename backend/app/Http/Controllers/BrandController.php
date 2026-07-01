<?php

namespace App\Http\Controllers;

use App\Http\Resources\BrandResource;
use App\Repositories\BrandRepository;
use App\Repositories\ItemRepository;
use App\Traits\Controller\RestControllerTrait;
use App\Validators\BrandValidator;

class BrandController extends Controller
{
    private $repository;

    private $validator;

    private $resource;

    private $partialUpdateFields = ['status'];

    use RestControllerTrait;

    public function __construct(BrandRepository $repository, BrandValidator $validator)
    {
        $this->repository = $repository;
        $this->validator = $validator;
        $this->resource = BrandResource::class;
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

            if ((new ItemRepository())->exists(['brand_id' => $id])) {
                $this->errorResponse('This Brand is used in Item');
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
