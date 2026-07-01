<?php

namespace App\Http\Controllers\Approval;

use Exception;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use App\Validators\StockAdjustmentValidator;
use App\Traits\Controller\RestControllerTrait;
use App\Repositories\StockAdjustmentRepository;
use App\Http\Resources\StockAdjustmentResource;
use App\Repositories\ItemRepository;
use App\Repositories\ItemStockOutHistoryRepository;
use App\Repositories\ItemStockRepository;
use App\Repositories\StockAdjustmentItemRepository;

class StockAdjustmentApprovalController extends Controller
{
    private $repository;

    private $stockAdjustmentItemRepository;

    private $itemStockOutHistoryRepository;

    private $itemStockRepository;

    private $validator;

    private $resource;

    private $partialUpdateFields = ['status'];

    use RestControllerTrait;

    public function __construct(StockAdjustmentRepository $repository, StockAdjustmentValidator $validator, StockAdjustmentItemRepository $stockAdjustmentItemRepository, ItemStockRepository $itemStockRepository, ItemStockOutHistoryRepository $itemStockOutHistoryRepository)
    {
        $this->repository = $repository;
        $this->stockAdjustmentItemRepository = $stockAdjustmentItemRepository;
        $this->itemStockOutHistoryRepository = $itemStockOutHistoryRepository;
        $this->itemStockRepository = $itemStockRepository;
        $this->validator = $validator;
        $this->resource = StockAdjustmentResource::class;
    }

    public function workflowProcess($updateFields, $id)
    {
        DB::beginTransaction();
        try {
            if (!isset($this->repository)) {
                $this->errorResponse('Repository not defined');
            }

            if (!empty($updateFields['process_status']) && $updateFields['process_status'] == 'APPROVED') {
                $stockAdjustmentInfo = $this->repository->findById($id);
                $response = $this->adjustStockItem($id, $stockAdjustmentInfo->adjustment_type);
                if ($response['error_status'] == true) {
                    $this->errorResponse($response['message']);
                }
            }

            // Update Requisition Process Status
            $this->repository->update($updateFields, $id);

            DB::commit();
            $response = 'Workflow process successfully';
            return $this->successResponse($response);
        } catch (Exception $e) {
            DB::rollBack();
            $this->errorResponse($e->getMessage());
            return false;
        }
    }

    private function adjustStockItem($stockAdjustmentId, $adjustmentType)
    {
        /**
         * STEP-1: INCREASE ITEM STOCK
         * STEP-2: DECREASE: ITEM STOCK CHECKING
         * STEP-3: DECREASE: STOCK OUT HISTORY
         * STEP-4: DECREASE: ADJUST ITEM STOCK BALANCE QUANTITY
         */
        $response = [
            'error_status' => false,
            'message'      => "",
        ];
        $stockAdjustmentInfo = $this->repository->findById($stockAdjustmentId);
        $stockAdjustmentItemList = $this->stockAdjustmentItemRepository->findWhere('stock_adjustment_id', $stockAdjustmentId);
        if ($stockAdjustmentItemList) {
            foreach ($stockAdjustmentItemList as $key => $adjustmentItem) {
                if ($adjustmentType == 'INCREASE') {
                    // CREATE NEW ONE
                    $this->itemStockRepository->create([
                        'branch_id'        => $stockAdjustmentInfo->branch_id,
                        'item_id'          => $adjustmentItem->item_id,
                        'shelve_id'        => $adjustmentItem->shelve_id,
                        'unit_price'       => $adjustmentItem->unit_price ?? 0,
                        'quantity'         => $adjustmentItem->quantity,
                        'balance_quantity' => $adjustmentItem->quantity,
                        'recordable_id'    => $adjustmentItem->id,
                        'recordable_type'  => 'App\Models\StockAdjustmentItem',
                        'action_from'      => 'Stock_Adjustment',
                        'remarks'          => "Stock-Adjustment/{$stockAdjustmentInfo->stock_adjustment_number}/{$adjustmentType}",
                    ]);
                } else if ($adjustmentType == 'DECREASE') {
                    // ITEM STOCK CHECKING
                    $requestedAdjustQty = $adjustmentItem->quantity;
                    $availableStockQty = $this->itemStockRepository->getItemWiseAvailableStockQty($stockAdjustmentInfo->branch_id, $adjustmentItem->item_id);
                    if ($availableStockQty < $requestedAdjustQty) {
                        $itemInfo = (new ItemRepository())->findById($adjustmentItem->item_id);
                        $response['error_status'] = true;
                        $response['message'] = "Insufficient quantity for {$itemInfo->code}";
                    }
                    $itemWiseStockList = $this->itemStockRepository->getItemWiseStockList('FIFO', $stockAdjustmentInfo->branch_id, $adjustmentItem->item_id, $requestedAdjustQty);
                    if (!empty($itemWiseStockList)) {
                        foreach ($itemWiseStockList as $key => $itemStock) {
                            // MATERIAL STOCK OUT HISTORY
                            $itemStockOut = [
                                'branch_id'       => $stockAdjustmentInfo->branch_id,
                                'item_stock_id'   => $itemStock->id,
                                'item_id'         => $itemStock->item_id,
                                'recordable_id'   => $adjustmentItem->id,
                                'recordable_type' => "App\Models\StockAdjustmentItem",
                                'action_from'     => 'STOCK_ADJUSTMENT',
                                'remarks'         => 'Stock Adjustment',
                            ];

                            if ($requestedAdjustQty <= $itemStock->balance_quantity) {
                                // MATERIAL STOCK - ADJUST THE STOCK BALANCE QUANTITY
                                $this->itemStockRepository->update([
                                    'balance_quantity' => $itemStock->balance_quantity - $requestedAdjustQty,
                                ], $itemStock->id);
                                // MATERIAL STOCK OUT HISTORY - STOCK OUT
                                $itemStockOut['quantity'] = $requestedAdjustQty;
                                $this->itemStockOutHistoryRepository->create($itemStockOut);
                                break;
                            } else {
                                // MATERIAL STOCK - ADJUST THE STOCK BALANCE QUANTITY
                                $this->itemStockRepository->update([
                                    'balance_quantity' => 0,
                                ], $itemStock->id);
                                $requestedAdjustQty -= $itemStock->balance_quantity;

                                // MATERIAL STOCK OUT HISTORY - STOCK OUT
                                $itemStockOut['quantity'] = $itemStock->balance_quantity;
                                $this->itemStockOutHistoryRepository->create($itemStockOut);
                            }
                        }
                    }
                }
            }
        } else {
            $response['error_status'] = true;
            $response['message'] = 'No stock adjustment item found';
        }
        return $response;
    }
}
