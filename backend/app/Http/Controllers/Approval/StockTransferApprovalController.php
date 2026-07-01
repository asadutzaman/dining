<?php

namespace App\Http\Controllers\Approval;

use App\Http\Controllers\Controller;
use App\Http\Resources\StockTransferResource;
use App\Repositories\ItemRepository;
use App\Repositories\ItemStockOutHistoryRepository;
use App\Repositories\ItemStockRepository;
use App\Repositories\StockTransferItemRepository;
use App\Repositories\StockTransferRepository;
use App\Traits\Controller\RestControllerTrait;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class StockTransferApprovalController extends Controller
{
    private $repository;

    private $stockTransferItemRepository;

    private $itemStockRepository;

    private $itemStockOutHistoryRepository;

    private $validator;

    private $resource;

    private $partialUpdateFields = ['status'];

    use RestControllerTrait;

    public function __construct(StockTransferRepository $repository, StockTransferItemRepository $stockTransferItemRepository, ItemStockRepository $itemStockRepository, ItemStockOutHistoryRepository $itemStockOutHistoryRepository)
    {
        $this->repository = $repository;
        $this->resource = StockTransferResource::class;
        $this->stockTransferItemRepository = $stockTransferItemRepository;
        $this->itemStockRepository = $itemStockRepository;
        $this->itemStockOutHistoryRepository = $itemStockOutHistoryRepository;
    }

    public function workflowProcess($updateFields, $id)
    {
        DB::beginTransaction();
        try {
            if (!isset($this->repository)) {
                $this->errorResponse('Repository not defined');
            }

            if (!empty($updateFields['process_status']) && $updateFields['process_status'] == 'APPROVED') {
                $response = $this->transferStockItem($id);
                if ($response['error_status'] == true) {
                    $this->errorResponse($response['message']);
                }
            }
            // Log::info('test', $updateFields);

            // Update Process Status
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

    private function transferStockItem($stockTransferId)
    {
        /**
         * STEP-1: WAREHOUSE ITEM STOCK CHECKING (transfer_from)
         * STEP-2: INSERT WAREHOUSE ITEM STOCK OUT HISTORY (transfer_from)
         * STEP-3: UPDATE WAREHOUSE ITEM STOCK BALANCE QUANTITY (transfer_from)
         * STEP-4: INSERT INTO BRANCH STOCK FROM WAREHOUSE (transfer_to)
         */
        $response = [
            'error_status' => false,
            'message'      => "",
        ];
        $stockTransferInfo = $this->repository->findById($stockTransferId);
        $stockTransferItemList = $this->stockTransferItemRepository->findWhere('stock_transfer_id', $stockTransferId);
        if ($stockTransferItemList) {
            foreach ($stockTransferItemList as $key => $transferItem) {
                // ITEM STOCK CHECKING
                $requestedTransferQty = $transferItem->quantity;
                // Calculate Total Requested Qty (Qty per branch * Number of branches)
                $transferToBranchIds = is_array($stockTransferInfo->transfer_to) ? $stockTransferInfo->transfer_to : [$stockTransferInfo->transfer_to];

                // Keep the per-branch quantity as entered
                $qtyPerBranch = $requestedTransferQty;
                if (is_array($transferToBranchIds)) {
                    $totalQtyAllBranches = $qtyPerBranch * count($transferToBranchIds);
                }

                $availableStockQty = $this->itemStockRepository->getItemWiseAvailableStockQty($stockTransferInfo->transfer_from, $transferItem->item_id);
                if ($availableStockQty < $totalQtyAllBranches) {
                    $itemInfo = (new ItemRepository())->findById($transferItem->item_id);
                    $response['error_status'] = true;
                    $response['message'] = "Insufficient quantity for {$itemInfo->code}";
                }
                $itemWiseStockList = $this->itemStockRepository->getItemWiseStockList('FIFO', $stockTransferInfo->transfer_from, $transferItem->item_id, $requestedTransferQty);
                if (!empty($itemWiseStockList)) {
                    foreach ($itemWiseStockList as $key => $itemStock) {
                        // MATERIAL STOCK OUT HISTORY
                        $itemStockOut = [
                            'branch_id'       => $stockTransferInfo->transfer_from,
                            'item_stock_id'   => $itemStock->id,
                            'item_id'         => $itemStock->item_id,
                            'recordable_id'   => $transferItem->id,
                            'recordable_type' => "App\Models\StockTransferItem",
                            'action_from'     => 'STOCK_TRANSFER',
                            'remarks'         => '',
                        ];

                        if ($requestedTransferQty <= $itemStock->balance_quantity) {
                            // MATERIAL STOCK - ADJUST THE STOCK BALANCE QUANTITY
                            $this->itemStockRepository->update([
                                'balance_quantity' => $itemStock->balance_quantity - $requestedTransferQty,
                            ], $itemStock->id);
                            // MATERIAL STOCK OUT HISTORY - STOCK OUT
                            $itemStockOut['quantity'] = $requestedTransferQty;
                            $this->itemStockOutHistoryRepository->create($itemStockOut);
                            break;
                        } else {
                            // MATERIAL STOCK - ADJUST THE STOCK BALANCE QUANTITY
                            $this->itemStockRepository->update([
                                'balance_quantity' => 0,
                            ], $itemStock->id);
                            $requestedTransferQty -= $itemStock->balance_quantity;

                            // MATERIAL STOCK OUT HISTORY - STOCK OUT
                            $itemStockOut['quantity'] = $itemStock->balance_quantity;
                            $this->itemStockOutHistoryRepository->create($itemStockOut);
                        }
                    }
                    // STEP-4: INSERT INTO BRANCH STOCK FROM WAREHOUSE
                    // Create stock records for each branch
                    foreach ($transferToBranchIds as $branchId) {
                        $this->itemStockRepository->create([
                            'branch_id'        => $branchId,
                            'item_id'          => $transferItem->item_id,
                            'shelve_id'        => null,
                            'unit_price'       => $transferItem->unit_price,
                            'quantity'         => $requestedTransferQty,
                            'balance_quantity' => $requestedTransferQty,
                            'recordable_id'    => $transferItem->id,
                            'recordable_type'  => 'App\Models\StockTransferItem',
                            'action_from'      => 'Stock_Transfer',
                            'remarks'          => 'Stock-Transfer',
                        ]);
                    }
                }
            }
        } else {
            $response['error_status'] = true;
            $response['message'] = 'No stock transfer item found';
        }
        return $response;
    }
}
