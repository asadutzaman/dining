<?php

namespace App\Http\Controllers;

use App\Validators\UnitValidator;
use App\Repositories\UnitRepository;
use App\Http\Resources\UnitResource;
use App\Repositories\CostOverheadRepository;
use App\Repositories\ItemRepository;
use App\Traits\Controller\RestControllerTrait;

class UnitController extends Controller
{
    private $repository;

    private $validator;

    private $resource;

    private $partialUpdateFields = ['status'];

    use RestControllerTrait;

    public function __construct(UnitRepository $repository, UnitValidator $validator)
    {
        $this->repository = $repository;
        $this->validator = $validator;
        $this->resource = UnitResource::class;
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

            if ((new ItemRepository())->exists(['base_unit_id' => $id])) {
                $this->errorResponse('This Unit is used in Item');
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
