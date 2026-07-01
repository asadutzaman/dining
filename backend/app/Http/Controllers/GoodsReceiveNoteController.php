<?php

namespace App\Http\Controllers;

use App\Exceptions\ValidatorException;
use App\Http\Resources\GoodsReceiveNoteResource;
use App\Repositories\BranchRepository;
use App\Repositories\CodeSequenceRepository;
use App\Repositories\GoodsReceiveNoteItemRepository;
use App\Repositories\GoodsReceiveNoteRepository;
use App\Repositories\ItemStockRepository;
use App\Traits\Controller\RestControllerTrait;
use App\Validators\GoodsReceiveNoteValidator;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Services\SessionService;
use Dotenv\Exception\ValidationException;

class GoodsReceiveNoteController extends Controller
{
    private $repository;

    private $goodsReceiveNoteItemRepository;

    private $itemStockRepository;

    private $validator;

    private $resource;

    private $partialUpdateFields = ['status'];

    use RestControllerTrait;

    public function __construct(GoodsReceiveNoteRepository $repository, GoodsReceiveNoteValidator $validator, GoodsReceiveNoteItemRepository $goodsReceiveNoteItemRepository, ItemStockRepository $itemStockRepository)
    {
        $this->repository = $repository;
        $this->validator = $validator;
        $this->resource = GoodsReceiveNoteResource::class;
        $this->goodsReceiveNoteItemRepository = $goodsReceiveNoteItemRepository;
        $this->itemStockRepository = $itemStockRepository;
    }

    public function store(Request $request)
    {
        /*
         * Step-1: Get GRN Latest Code
         * Step-2: Store GRN Data
         * Step-3: Store GRN Item Data
         * Step-4: Update Code Sequence
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

            // GENERATE REQUISITION NUMBER
            $latestCodeSequence = (new CodeSequenceRepository())->getLatestCodeByLabel('GRN');
            if ($latestCodeSequence == null) {
                $this->errorResponse("Number Sequence not found!");
            }

            // CHECK DUPLICATE GRN NUMBER
            $checkDuplicateGrnNumber = $this->repository->checkGrnNumberUnique($latestCodeSequence);
            if ($checkDuplicateGrnNumber > 0) {
                $this->errorResponse("{$latestCodeSequence} - This Number Sequence is already exist!");
            }

            // Get user data from session
            $sessionService = (new SessionService())->init();
            $userData = $sessionService->getUserData();
            if (empty($userData['branch_id'])) {
                $this->errorResponse("User branch not found!");
            }

            // CHECK WAREHOUSE OR NOT
            $warehouseInfo = (new BranchRepository())->findById($userData['branch_id']);
            if (!empty($warehouseInfo) && $warehouseInfo->type != 'Warehouse') {
                $this->errorResponse("You are not eligible from your Branch!");
            }

            // Save GRN Value
            $grnValueResult =  $this->repository->create([
                'grn_number'       => $latestCodeSequence,
                'branch_id'        => $userData['branch_id'],
                'supplier_id'      => $formData['supplier_id'],
                'logistic_id'      => $userData['logistic_id'],
                'ref_po_number'    => $formData['ref_po_number'],
                'ref_po_date'      => $formData['ref_po_date'],
                'ref_challan_no'   => $formData['ref_challan_no'],
                'ref_challan_date' => $formData['ref_challan_date'],
                'received_date'    => Now(),
                'remarks'          => $formData['remarks'],
                'process_status'   => $request->process_status,
            ]);

            if (empty($grnValueResult)) {
                $this->errorResponse("GRN Value save fail!");
            }

            if (!isset($this->goodsReceiveNoteItemRepository)) {
                $this->errorResponse('GRN Item Repository not defined');
            }


            $grnItemList = !empty($formData['grnItemsList']) ? $formData['grnItemsList'] : null;
            if ($grnItemList) {
                foreach ($grnItemList as $key => $item) {
                    $this->goodsReceiveNoteItemRepository->create([
                        'goods_receive_note_id'           => $grnValueResult['id'],
                        'item_id'          => $item['item_id'],
                        'unit_price'       => $item['unit_price'] ?? 0,
                        'quantity'         => $item['quantity'],
                        'total_price'      => ($item['unit_price'] ?? 0) * $item['quantity'],
                        'expire_date'      => $item['expire_date'] ?? null,
                        'shelve_id'        => $item['shelve_id'] ?? null,
                        'remarks'          => $item['remarks'],
                    ]);
                }
            }
            // UPDATE REQUISITION NUMBER
            (new CodeSequenceRepository())->updateNextSequenceByLabel('GRN');

            DB::commit();
            $response = isset($this->resource) ? new $this->resource($grnValueResult) : $grnValueResult;
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
        /*
         * Step-1: Update GRN Data
         * Step-2: Update GRN Item Data
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

            // Get user data from session
            $sessionService = (new SessionService())->init();
            $userData = $sessionService->getUserData();
            if (empty($userData['branch_id'])) {
                $this->errorResponse("User branch not found!");
            }

            // CHECK WAREHOUSE OR NOT
            $warehouseInfo = (new BranchRepository())->findById($userData['branch_id']);
            if (!empty($warehouseInfo) && $warehouseInfo->type != 'Warehouse') {
                $this->errorResponse("You are not eligible from your Branch!");
            }

            // Update GRN Value
            $this->repository->update([
                'branch_id'        => $userData['branch_id'],
                'supplier_id'      => $formData['supplier_id'],
                'logistic_id'      => $userData['logistic_id'],
                'ref_po_number'    => $formData['ref_po_number'],
                'ref_po_date'      => $formData['ref_po_date'],
                'ref_challan_no'   => $formData['ref_challan_no'],
                'ref_challan_date' => $formData['ref_challan_date'],
                'received_date'    => Now(),
                'remarks'          => $formData['remarks'],
                'process_status'   => $request->process_status,
            ], $id);


            $grnItemListData = !empty($formData['grnItemsList']) ? $formData['grnItemsList'] : null;
            if (!empty($grnItemListData)) {
                // NONMATCH DATA DELETE
                $grnItemIds = array_column($grnItemListData, 'id');
                if (count($grnItemIds) > 0) {
                    $this->goodsReceiveNoteItemRepository->deleteGRNItemByIds($id, $grnItemIds);
                }
                foreach ($grnItemListData as $key => $item) {
                    $grnItemData = [
                        'goods_receive_note_id' => $id,
                        'item_id'              => $item['item_id'],
                        'unit_price'           => $item['unit_price'] ?? 0,
                        'quantity'             => $item['quantity'],
                        'total_price'          => ($item['unit_price'] ?? 0) * $item['quantity'],
                        'expire_date'          => $item['expire_date'] ?? null,
                        'shelve_id'            => $item['shelve_id'] ?? null,
                        'remarks'              => $item['remarks'],
                    ];

                    if (!empty($item['id'])) {
                        // UPDATE OLD ONE
                        $this->goodsReceiveNoteItemRepository->update($grnItemData, $item['id']);
                    } else {
                        // CREATE NEW ONE
                        $this->goodsReceiveNoteItemRepository->create($grnItemData);
                    }
                }
            }

            // // DELETE UNMATCHED EXISTING ITEMS
            // // This must happen BEFORE creating new items, otherwise new items (which are not in $processedItemIds) would be deleted.
            // $this->goodsReceiveNoteItemRepository->deleteGRNItemByIds($id, $processedItemIds);

            // // CREATE NEW ITEMS
            // foreach ($newItemsToCreate as $newItem) {
            //     $this->goodsReceiveNoteItemRepository->create($newItem);
            // }

            DB::commit();
            $result = $this->repository->show($id);
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

    // Item Wise Grn Details
    public function getItemGrnDetails(Request $request)
    {
        try {
            $results = $this->goodsReceiveNoteItemRepository->getItemGrnDetails($request->all());
            return $this->successResponse([
                'results' => $results,
            ]);
        } catch (Exception $e) {
            $this->errorResponse($e->getMessage());
        }
    }
}
