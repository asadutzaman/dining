<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Exceptions\ValidatorException;
use App\Validators\ItemCategoryValidator;
use App\Repositories\ItemCategoryRepository;
use App\Http\Resources\ItemCategoryResource;
use App\Repositories\ItemRepository;
use App\Traits\Controller\RestControllerTrait;
use Dotenv\Exception\ValidationException;

class ItemCategoryController extends Controller
{
    private $repository;

    private $validator;

    private $resource;

    private $partialUpdateFields = ['status'];

    use RestControllerTrait;

    public function __construct(ItemCategoryRepository $repository, ItemCategoryValidator $validator)
    {
        $this->repository = $repository;
        $this->validator = $validator;
        $this->resource = ItemCategoryResource::class;
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

            $duplicateExist = $this->repository->checkCodeUnique($request->name);
            if (isset($duplicateExist)) {
                $this->errorResponse('This Data is already exist!');
            }

            $result =  $this->repository->create($request->all());
            $response = isset($this->resource) ? new $this->resource($result) : $result;
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

            $duplicateExist = $this->repository->checkCodeUnique($request->name, $id);
            if (isset($duplicateExist)) {
                $this->errorResponse('This Data is already exist!');
            }

            $response = $this->repository->update($request->all(), $id);

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

            if ((new ItemRepository())->exists(['item_category_id' => $id])) {
                $this->errorResponse('Item Category is used in Item');
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
