<?php

namespace App\Http\Controllers;

use App\Repositories\ItemRepository;
use App\Repositories\ItemStockRepository;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Exceptions\ValidatorException;
use App\Validators\StockTransferValidator;
use App\Http\Resources\StockTransferResource;
use App\Repositories\CodeSequenceRepository;
use App\Repositories\StockTransferItemRepository;
use App\Repositories\StockTransferRepository;
use App\Repositories\BranchRepository;
use App\Traits\Controller\RestControllerTrait;
use League\Config\Exception\ValidationException;
use Illuminate\Support\Facades\Log;

class StockTransferController extends Controller
{
    private $repository;

    private $stockTransferItemRepository;
    private $itemStockRepository;
    private $branchRepository;

    private $validator;

    private $resource;

    private $partialUpdateFields = ['status'];

    use RestControllerTrait;

    public function __construct(
        StockTransferRepository $repository,
        StockTransferValidator $validator,
        StockTransferItemRepository $stockTransferItemRepository,
        ItemStockRepository $itemStockRepository,
        BranchRepository $branchRepository
    ) {
        $this->repository = $repository;
        $this->validator = $validator;
        $this->resource = StockTransferResource::class;
        $this->stockTransferItemRepository = $stockTransferItemRepository;
        $this->itemStockRepository = $itemStockRepository;
        $this->branchRepository = $branchRepository;
    }

    public function store(Request $request)
    {
        /*
         * Step-1: Get Stock Transfer Latest Code
         * Step-2: Store Stock Transfer Data
         * Step-3: Check Item Stock
         * Step-4: Store Stock Transfer Item Data
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

            // GENERATE STOCK_TRANSFER NUMBER
            $latestCodeSequence = (new CodeSequenceRepository())->getLatestCodeByLabel('STOCK_TRANSFER');
            if ($latestCodeSequence == null) {
                $this->errorResponse("Number Sequence not found!");
            }

            // CHECK DUPLICATE STOCK_TRANSFER NUMBER
            $checkDuplicateStockTransferNumber = $this->repository->checkStockTransferNumberUnique($latestCodeSequence);
            if ($checkDuplicateStockTransferNumber > 0) {
                $this->errorResponse("{$latestCodeSequence} - This Number Sequence is already exist!");
            }

            // Get user data from session
            // $sessionService = (new SessionService())->init();
            // $userData = $sessionService->getUserData();

            // Save Stock Transfer Value
            $stockTransferValueResult =  $this->repository->create([
                'stock_transfer_number' => $latestCodeSequence,
                'transfer_from'         => $formData['transfer_from'],
                'transfer_to'           => $formData['transfer_to'],
                'reason'                => $formData['reason'],
                'process_status'        => $formData['process_status'],
            ]);

            if (empty($stockTransferValueResult)) {
                $this->errorResponse("Stock Transfer Value save fail!");
            }

            if (!isset($this->stockTransferItemRepository)) {
                $this->errorResponse('Stock Transfer Item Repository not defined');
            }


            $stockTransferItemList = !empty($formData['stockTransferItemsList']) ? $formData['stockTransferItemsList'] : null;
            if ($stockTransferItemList) {
                foreach ($stockTransferItemList as $key => $item) {

                    // ITEM STOCK CHECKING
                    $requestedTransferQty = $item['quantity'];

                    // Calculate Total Requested Qty 
                    // Keep the per-branch quantity as entered
                    $qtyPerBranch = $requestedTransferQty;
                    if (is_array($formData['transfer_to'])) {
                        $totalQtyAllBranches = $qtyPerBranch * count($formData['transfer_to']);
                    }

                    $availableStockQty = $this->itemStockRepository->getItemWiseAvailableStockQty($formData['transfer_from'], $item['item_id']);

                    if ($availableStockQty < $totalQtyAllBranches) {
                        $itemInfo = (new ItemRepository())->findById($item['item_id']);
                        $this->errorResponse("{$itemInfo['code']} - This Item is not available in stock!");
                    }
                    $this->stockTransferItemRepository->create([
                        'stock_transfer_id' => $stockTransferValueResult['id'],
                        'item_id'           => $item['item_id'],
                        'quantity'          => $item['quantity'],
                        'remarks'           => $item['remarks'],
                    ]);
                }
            }
            // UPDATE STOCK_TRANSFER NUMBER
            (new CodeSequenceRepository())->updateNextSequenceByLabel('STOCK_TRANSFER');

            DB::commit();
            $response = isset($this->resource) ? new $this->resource($stockTransferValueResult) : $stockTransferValueResult;
            return $this->successResourceResponse($response);
        } catch (ValidationException $e) {
            DB::rollBack();
            throw new ValidatorException($e);
        } catch (\Exception $e) {
            DB::rollBack();
            $this->errorResponse($e->getMessage());
        }
    }

    //UPDATE STOCK TRANSFER
    public function update(Request $request, $id)
    {
        /*
         * Step-1: Update Stock Transfer Data
         * Step-2: Check Item Stock
         * Step-3: Update Stock Transfer Item Data
        */

        DB::beginTransaction();
        try {
            $formData = $request->all();

            if (!isset($this->repository)) {
                $this->errorResponse('Repository not defined');
            }

            if (isset($this->validator)) {
                $this->validate($request, $this->validator->rules($id), $this->validator->messages());
            }

            // Update Stock Transfer Value
            $this->repository->update([
                'transfer_from'         => $formData['transfer_from'],
                'transfer_to'           => $formData['transfer_to'],
                'reason'                => $formData['reason'],
                'process_status'        => $formData['process_status'],
            ], $id);


            $stockTransferItemListData = !empty($formData['stockTransferItemsList']) ? $formData['stockTransferItemsList'] : [];
            if (!empty($stockTransferItemListData)) {
                // NONMATCH DATA DELETE
                $stockTransferItemIds = array_column($stockTransferItemListData, 'id');

                if (count($stockTransferItemIds) > 0) {
                    $this->stockTransferItemRepository->deleteStockTransferItemByIds($id, $stockTransferItemIds);
                }
                foreach ($stockTransferItemListData as $key => $item) {
                    // ITEM STOCK CHECKING
                    $requestedTransferQty = $item['quantity'];
                    // Calculate Total Requested Qty (Qty per branch * Number of branches)
                    if (is_array($formData['transfer_to'])) {
                        $requestedTransferQty *= count($formData['transfer_to']);
                    }
                    $availableStockQty = $this->itemStockRepository->getItemWiseAvailableStockQty($formData['transfer_from'], $item['item_id']);
                    if ($availableStockQty < $requestedTransferQty) {
                        $itemInfo = (new ItemRepository())->findById($item['item_id']);
                        $this->errorResponse("{$itemInfo['code']} - This Item is not available in stock!");
                    }
                    $stockTransferItemData = [
                        'stock_transfer_id' => $id,
                        'item_id'           => $item['item_id'],
                        'quantity'          => $item['quantity'],
                        'remarks'           => $item['remarks'],
                    ];

                    if (!empty($item['id'])) {
                        // UPDATE OLD ONE
                        $this->stockTransferItemRepository->update($stockTransferItemData, $item['id']);
                    } else {
                        // CREATE NEW ONE
                        $this->stockTransferItemRepository->create($stockTransferItemData);
                    }
                }
            }

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
}
