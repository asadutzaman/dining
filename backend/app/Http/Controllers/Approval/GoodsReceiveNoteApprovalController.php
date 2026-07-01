<?php

namespace App\Http\Controllers\Approval;

use App\Http\Controllers\Controller;
use App\Http\Resources\GoodsReceiveNoteResource;
use App\Repositories\GoodsReceiveNoteItemRepository;
use App\Repositories\GoodsReceiveNoteRepository;
use App\Repositories\ItemStockRepository;
use App\Services\SessionService;
use App\Traits\Controller\RestControllerTrait;
use App\Validators\GoodsReceiveNoteValidator;
use Exception;
use Illuminate\Support\Facades\DB;

class GoodsReceiveNoteApprovalController extends Controller
{
    private $repository;

    private $goodsReceiveNoteItemRepository;

    private $itemStockRepository;

    private $validator;

    private $resource;

    private $partialUpdateFields = ['status'];

    use RestControllerTrait;

    public function __construct(GoodsReceiveNoteRepository $repository, GoodsReceiveNoteItemRepository $goodsReceiveNoteItemRepository, ItemStockRepository $itemStockRepository)
    {
        $this->repository = $repository;
        $this->resource = GoodsReceiveNoteResource::class;
        $this->goodsReceiveNoteItemRepository = $goodsReceiveNoteItemRepository;
        $this->itemStockRepository = $itemStockRepository;
    }

    public function workflowProcess($updateFields, $id)
    {
        DB::beginTransaction();
        try {
            if (!isset($this->repository)) {
                $this->errorResponse('Repository not defined');
            }

            if (!empty($updateFields['process_status']) && $updateFields['process_status'] == 'APPROVED') {
                $response = $this->stockItem($id);
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

    private function stockItem($goodsReceiveNoteId)
    {
        $response = [
            'error_status' => false,
            'message'      => "",
        ];
        $grnInfo = $this->repository->findById($goodsReceiveNoteId);
        $grnItemList = $this->goodsReceiveNoteItemRepository->findWhere('goods_receive_note_id', $goodsReceiveNoteId);
        if ($grnItemList) {
            foreach ($grnItemList as $key => $item) {
                // CREATE NEW ONE
                $this->itemStockRepository->create([
                    'branch_id'        => $grnInfo->branch_id,
                    'item_id'          => $item->item_id,
                    'shelve_id'        => $item->shelve_id,
                    'unit_price'       => $item->unit_price,
                    'quantity'         => $item->quantity,
                    'balance_quantity' => $item->quantity,
                    'recordable_id'    => $item->id,
                    'recordable_type'  => 'App\Models\GoodsReceiveNoteItem',
                    'action_from'      => 'GRN',
                    'remarks'          => "Goods-Receive-Note/{$grnInfo->grn_number}",
                ]);
            }
        } else {
            $response['error_status'] = true;
            $response['message'] = 'Goods receive note item not found';
        }
        return $response;
    }
}
