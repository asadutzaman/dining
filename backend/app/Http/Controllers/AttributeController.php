<?php

namespace App\Http\Controllers;

use App\Exceptions\ValidatorException;
use App\Http\Resources\AttributeResource;
use App\Http\Resources\AttributeValueResource;
use App\Repositories\AttributeRepository;
use App\Repositories\AttributeValueRepository;
use App\Repositories\ItemAttributeRepository;
use App\Services\ResourceService;
use App\Traits\Controller\RestControllerTrait;
use App\Validators\AttributeValidator;
use Dotenv\Exception\ValidationException;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AttributeController extends Controller
{
    private $repository;

    private $attributeValueRepository;

    private $epository;

    private $validator;

    private $resource;

    private $partialUpdateFields = ['status'];

    use RestControllerTrait;

    public function __construct(AttributeRepository $repository, AttributeValidator $validator, AttributeValueRepository $attributeValueRepository)
    {
        $this->repository = $repository;
        $this->validator = $validator;
        $this->resource = AttributeResource::class;
        $this->attributeValueRepository = $attributeValueRepository;
    }

    public function store(Request $request)
    {
        DB::beginTransaction();
        try {
            $formData = $request->all();

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

            $attributeValueResult =  $this->repository->create($request->all());
            if (empty($attributeValueResult)) {
                throw new Exception("Attribute Value save fail!");
            }

            if (!isset($this->attributeValueRepository)) {
                $this->errorResponse('Attribute Value Repository not defined');
            }

            $attributeValueList = !empty($formData['attributeValueList']) ? $formData['attributeValueList'] : null;
            if ($attributeValueList) {
                foreach ($attributeValueList as $key => $item) {
                    $attributeValueItem = $item;
                    $attributeValueItem['attribute_id'] = $attributeValueResult['id'];
                    $attributeValueItem['value'] = $item['value'];

                    $this->attributeValueRepository->create($attributeValueItem);
                }
            }

            DB::commit();
            $response = isset($this->resource) ? new $this->resource($attributeValueResult) : $attributeValueResult;
            return $this->successResourceResponse($response);
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
        DB::beginTransaction();
        try {
            $formData = $request->all();

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

            $attributeResult =  $this->repository->update($request->all(), $id);
            if (empty($attributeResult)) {
                throw new Exception("Attribute save fail!");
            }

            if (!isset($this->attributeValueRepository)) {
                $this->errorResponse('Attribute Value Repository not defined');
            }

            $attributeValueList = !empty($formData['attributeValueList']) ? $formData['attributeValueList'] : [];

            if ($attributeValueList) {
                // NONMATCH DATA DELETE
                $attributeValueIds = array_column($attributeValueList, 'id');
                $this->attributeValueRepository->deleteAttributeValueByIds($id, $attributeValueIds);

                foreach ($attributeValueList as $key => $item) {
                    // $attributeValueItem = $item;

                    $attributeValueItem = [
                        'attribute_id' => $id,
                        'value' => $item['value'],
                    ];

                    if (!empty($item['id'])) {
                        // UPDATE OLD ONE
                        $this->attributeValueRepository->update($attributeValueItem, $item['id']);
                    } else {
                        // CREATE NEW ONE
                        $this->attributeValueRepository->create($attributeValueItem);
                    }
                }
            }

            // Get Data
            DB::commit();
            $response = $this->repository->show($id);
            $response = ResourceService::getResources($response, AttributeValueResource::class);
            return $this->successResourceResponse($response);
        } catch (ValidationException $e) {
            DB::rollBack();
            throw new ValidatorException($e);
        } catch (\Exception $e) {
            DB::rollBack();
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

            if ((new ItemAttributeRepository())->exists(['attribute_id' => $id])) {
                $this->errorResponse('This Attribute is used in Item Attribute');
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
