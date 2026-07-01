<?php

namespace App\Http\Controllers;

use App\Exceptions\ValidatorException;
use App\Http\Resources\ItemResource;
use App\Repositories\CodeSequenceRepository;
use App\Repositories\GoodsReceiveNoteItemRepository;
use App\Repositories\ItemAttributeRepository;
use App\Repositories\ItemRepository;
use App\Imports\ItemImport;
use App\Repositories\ItemStockRepository;
use App\Repositories\UnitMappingRepository;
use App\Traits\Controller\RestControllerTrait;
use App\Validators\ItemValidator;
use Dotenv\Exception\ValidationException;
// use Illuminate\Validation\ValidationException;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ItemController extends Controller
{
    private $repository;

    private $itemAttributeRepository;

    private $unitMappingRepository;

    private $validator;

    private $resource;

    private $partialUpdateFields = ['status'];

    use RestControllerTrait;

    public function __construct(ItemRepository $repository, ItemAttributeRepository $itemAttributeRepository, UnitMappingRepository $unitMappingRepository, ItemValidator $validator)
    {
        $this->repository = $repository;
        $this->itemAttributeRepository = $itemAttributeRepository;
        $this->unitMappingRepository = $unitMappingRepository;
        $this->validator = $validator;
        $this->resource = ItemResource::class;
    }

    public function index()
    {
        try {
            if (!isset($this->repository)) {
                $this->errorResponse('Repository not defined');
            }

            $result = $this->repository->list();
            $result['results'] = isset($this->resource) ? $this->resource::collection($result['results']) : $result['results'];
            return $this->successResourceCollectionResponse($result);
        } catch (\Exception $e) {
            $this->errorResponse($e->getMessage());
        }
    }

    public function store(Request $request)
    {
        /**
         * Step-1: Get Item Latest Code
         * Step-2: Store Item Data
         * Step-3: Store Item Attribute Data
         * Step-4: Store Unit Mapping Data
         * Step-5: Update Code Sequence
         */
        DB::beginTransaction();
        try {
            $formData = $request->all();

            if (!isset($this->repository)) {
                $this->errorResponse('Repository not defined');
            }

            if (isset($this->validator)) {
                $this->validate($request, $this->validator->rules(), $this->validator->messages());
            }

            // GENERATE ITEM CODE
            $latestCodeSequence = (new CodeSequenceRepository())->getLatestCodeByLabel('ITEM');
            if ($latestCodeSequence == null) {
                $this->errorResponse("Code Sequence not found!");
            }

            // CHECK DUPLICATE ITEM CODE
            $checkDuplicateItemCode = $this->repository->checkItemCodeUnique($latestCodeSequence);
            if ($checkDuplicateItemCode > 0) {
                $this->errorResponse("{$latestCodeSequence} - This Code Sequence is already exist!");
            }

            // CHECK DUPLICATE NAME CODE
            $checkDuplicateNameCode = $this->repository->checkItemNameCodeUnique($request->name_en);
            if ($checkDuplicateNameCode > 0) {
                $this->errorResponse("{$request->name_en} - This Name is already exist!");
            }

            $result =  $this->repository->create([
                'type'             => $request->type,
                'logistic_id'      => $request->logistic_id,
                'item_category_id' => $request->item_category_id,
                'brand_id'         => $request->brand_id,
                'base_unit_id'     => $request->base_unit_id,
                'code'             => $latestCodeSequence,
                'name_en'          => $request->name_en,
                'name_bn'          => $request->name_bn,
                'description'      => $request->description,
                'reorder_qty'      => $request->reorder_qty,
            ]);

            $itemAttributeListData = !empty($formData['item_attributes']) ? $formData['item_attributes'] : [];
            if (!empty($itemAttributeListData)) {
                // NONMATCH DATA DELETE
                $itemAttributeIds = array_column($itemAttributeListData, 'id');
                if (count($itemAttributeIds) > 0) {
                    $this->itemAttributeRepository->deleteItemAttributeByIds($result['id'], $itemAttributeIds);
                }
                foreach ($itemAttributeListData as $key => $item) {
                    // CREATE NEW ONE
                    $this->itemAttributeRepository->create([
                        'item_id'            => $result['id'],
                        'attribute_id'       => $item['attribute_id'],
                        'attribute_value_id' => $item['attribute_value_id'],
                    ]);
                }
            }

            $itemUnitMappingListData = !empty($formData['item_unit_mappings']) ? $formData['item_unit_mappings'] : [];
            if (!empty($itemUnitMappingListData)) {
                // NONMATCH DATA DELETE
                $itemUnitMappingIds = array_column($itemUnitMappingListData, 'id');
                if (count($itemUnitMappingIds) > 0) {
                    $this->unitMappingRepository->deleteUnitMappingByIds($result['id'], $itemUnitMappingIds);
                }
                foreach ($itemUnitMappingListData as $key => $item) {
                    // CREATE NEW ONE
                    $this->unitMappingRepository->create([
                        'item_id'            => $result['id'],
                        'unit_id'            => $item['unit_id'],
                        'conversion_to_base' => $item['conversion_to_base'],
                    ]);
                }
            }

            // UPDATE CODE SEQUENCE
            (new CodeSequenceRepository())->updateNextSequenceByLabel('ITEM');

            DB::commit();
            $response = isset($this->resource) ? new $this->resource($result) : $result;
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
        /**
         * Step-1: Get Item Latest Code
         * Step-2: Store Item Data
         * Step-3: Store Item Attribute Data
         * Step-4: Store Unit Mapping Data
         * Step-5: Update Code Sequence
         */
        DB::beginTransaction();
        try {
            $formData = $request->all();
            if (!isset($this->repository)) {
                $this->errorResponse('Repository not defined');
            }

            if (isset($this->validator)) {
                $this->validate($request, $this->validator->rules(), $this->validator->messages());
            }

            // CHECK DUPLICATE NAME CODE
            $checkDuplicateNameCode = $this->repository->checkItemNameCodeUnique($request->name_en, $id);
            if ($checkDuplicateNameCode > 0) {
                $this->errorResponse("{$request->name_en} - This Name is already exist!");
            }

            $response = $this->repository->update([
                'type'             => $request->type,
                'logistic_id'      => $request->logistic_id,
                'item_category_id' => $request->item_category_id,
                'brand_id'         => $request->brand_id,
                'base_unit_id'     => $request->base_unit_id,
                'name_en'          => $request->name_en,
                'name_bn'          => $request->name_bn,
                'description'      => $request->description,
                'reorder_qty'      => $request->reorder_qty,
            ], $id);

            $itemAttributeListData = !empty($formData['item_attributes']) ? $formData['item_attributes'] : [];
            if (!empty($itemAttributeListData)) {
                // NONMATCH DATA DELETE
                $itemAttributeIds = array_column($itemAttributeListData, 'id');
                if (count($itemAttributeIds) > 0) {
                    $this->itemAttributeRepository->deleteItemAttributeByIds($id, $itemAttributeIds);
                }
                foreach ($itemAttributeListData as $key => $item) {
                    $itemAttributeData = [
                        'item_id'            => $id,
                        'attribute_id'       => $item['attribute_id'],
                        'attribute_value_id' => $item['attribute_value_id'],
                    ];

                    if (!empty($item['id'])) {
                        // UPDATE OLD ONE
                        $this->itemAttributeRepository->update($itemAttributeData, $item['id']);
                    } else {
                        // CREATE NEW ONE
                        $this->itemAttributeRepository->create($itemAttributeData);
                    }
                }
            }

            $itemUnitMappingListData = !empty($formData['item_unit_mappings']) ? $formData['item_unit_mappings'] : [];
            if (!empty($itemUnitMappingListData)) {
                // NONMATCH DATA DELETE
                $itemUnitMappingIds = array_column($itemUnitMappingListData, 'id');
                if (count($itemUnitMappingIds) > 0) {
                    $this->unitMappingRepository->deleteUnitMappingByIds($id, $itemUnitMappingIds);
                }
                foreach ($itemUnitMappingListData as $key => $item) {
                    $unitMappingData = [
                        'item_id'            => $id,
                        'unit_id'            => $item['unit_id'],
                        'conversion_to_base' => $item['conversion_to_base'],
                    ];

                    if (!empty($item['id'])) {
                        // UPDATE OLD ONE
                        $this->unitMappingRepository->update($unitMappingData, $item['id']);
                    } else {
                        // CREATE NEW ONE
                        $this->unitMappingRepository->create($unitMappingData);
                    }
                }
            }
            // Get Data
            $result = $this->repository->show($id);
            DB::commit();
            $response = isset($this->resource) ? new $this->resource($result, false) : $result;
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
        DB::beginTransaction();
        try {
            if (!isset($this->repository)) {
                $this->errorResponse('Repository not defined');
            }

            $entity = $this->repository->findById($id);
            if (!$entity) {
                $this->notFoundResponse();
            }

            // RECORD DELETE CRITERIA
            if ((new GoodsReceiveNoteItemRepository())->exists(['item_id' => $id])) {
                $this->errorResponse('This Item is used in Goods Receive Note Item');
            }

            if ((new ItemStockRepository())->exists(['item_id' => $id])) {
                $this->errorResponse('This Item is used in Item Stock');
            }

            if (!isset($this->itemAttributeRepository)) {
                $this->errorResponse('Item Attribute Repository not defined');
            }
            $this->itemAttributeRepository->deleteBy('item_id', $id);

            if (!isset($this->unitMappingRepository)) {
                $this->errorResponse('Unit Mapping Repository not defined');
            }
            $this->unitMappingRepository->deleteBy('item_id', $id);

            $response = $this->repository->delete($id);
            if (!$response) {
                $this->errorResponse();
            }
            DB::commit();
            return $this->deleteResponse();
        } catch (\Exception $e) {
            DB::rollBack();
            $this->errorResponse($e->getMessage());
        }
    }

    public function bulkStore()
    {

        ini_set('max_execution_time', '0');
        $fileRealPath = storage_path('app/public/MaterialsBulkStore.xlsx');
        // $fileRealPath = public_path('MaterialsBulkStore.xlsx');

        // $fileRealPath = base_path('MaterialsBulkStore.xlsx');


        $import = new ItemImport();
        $import->import($fileRealPath);

        return $this->successResponse(['Success']);
    }
}
