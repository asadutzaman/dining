<?php

namespace App\Http\Controllers;

use App\Http\Resources\BranchResource;
use App\Repositories\BranchRepository;
use App\Traits\Controller\RestControllerTrait;
use App\Validators\BranchValidator;
use App\Exceptions\ValidatorException;
use App\Repositories\ItemStockRepository;
use App\Repositories\UserRepository;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class BranchController extends Controller
{
    private $repository;

    private $validator;

    private $resource;

    private $partialUpdateFields = ['status'];

    use RestControllerTrait;

    public function __construct(BranchRepository $repository, BranchValidator $validator)
    {
        $this->repository = $repository;
        $this->validator = $validator;
        $this->resource = BranchResource::class;
    }

    public function store(Request $request)
    {
        try {
            if (!isset($this->repository)) {
                $this->errorResponse('Repository not defined');
            }

            if (isset($this->validator)) {
                $this->validate($request, $this->validator->rules(), $this->validator->messages());
            }

            $existWarehouse = $this->repository->checkWarehouseExist();
            if ($existWarehouse && $request->type == 'Warehouse') {
                $this->errorResponse('Warehouse creation is restricted.');
            }

            $result =  $this->repository->create($request->all());
            $response = isset($this->resource) ? new $this->resource($result, false) : $result;
            return $this->successResourceResponse($response);
        } catch (ValidationException $e) {
            throw new ValidatorException($e);
        } catch (\Exception $e) {
            $this->errorResponse($e->getMessage());
        }
    }

    public function update(Request $request, $id)
    {
        try {
            if (!isset($this->repository)) {
                $this->errorResponse('Repository not defined');
            }

            if (isset($this->validator)) {
                $this->validate($request, $this->validator->rules(), $this->validator->messages());
            }

            $existWarehouse = $this->repository->checkWarehouseExist($id);
            if ($existWarehouse && $request->type == 'Warehouse') {
                $this->errorResponse('Warehouse creation is restricted.');
            }

            $response = $this->repository->update($request->all(), $id);

            // Get Data
            $result = $this->repository->show($id);
            $response = isset($this->resource) ? new $this->resource($result, false) : $result;
            return $this->successResourceResponse($response);
        } catch (ValidationException $e) {
            throw new ValidatorException($e);
        } catch (\Exception $e) {
            $this->errorResponse($e->getMessage());
        }
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

            // RECORD DELETE CRITERIA
            $isUsedInUser = (new UserRepository())->exists(['branch_id' => $id]);
            if ($isUsedInUser) {
                $this->errorResponse('This Branch is used in User');
            }

            $isUsedInItemStock = (new ItemStockRepository())->exists(['branch_id' => $id]);
            if ($isUsedInItemStock) {
                $this->errorResponse('This Branch is used in Item Stock');
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

    public function getBranchTree(Request $request)
    {
        $response = $this->repository->getBranchTree();
        return $this->successResponse($response);
    }
}
