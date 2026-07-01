<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\SessionService;
use Illuminate\Support\Facades\DB;
use App\Exceptions\ValidatorException;
use Dotenv\Exception\ValidationException;
use App\Validators\StockAdjustmentValidator;
use App\Repositories\CodeSequenceRepository;
use App\Traits\Controller\RestControllerTrait;
use App\Repositories\StockAdjustmentRepository;
use App\Http\Resources\StockAdjustmentResource;
use App\Repositories\BranchRepository;
use App\Repositories\ItemStockRepository;
use App\Repositories\StockAdjustmentItemRepository;
use App\Repositories\ItemStockOutHistoryRepository;

class StockAdjustmentController extends Controller
{
    private $repository;

    private $stockAdjustmentItemRepository;

    private $itemStockRepository;

    private $validator;

    private $resource;

    private $partialUpdateFields = ['status'];

    use RestControllerTrait;

    public function __construct(StockAdjustmentRepository $repository, StockAdjustmentValidator $validator, StockAdjustmentItemRepository $stockAdjustmentItemRepository, ItemStockRepository $itemStockRepository)
    {
        $this->repository = $repository;
        $this->stockAdjustmentItemRepository = $stockAdjustmentItemRepository;
        $this->itemStockRepository = $itemStockRepository;
        $this->validator = $validator;
        $this->resource = StockAdjustmentResource::class;
    }

    public function store(Request $request)
    {
        /*
        * Step-1: Get STOCK ADJUSTMENT Latest Code
        * Step-2: Store STOCK ADJUSTMENT Data
        * Step-3: Store STOCK ADJUSTMENT Item Data
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

            // GENERATE STOCK ADJUSTMENT NUMBER
            $latestCodeSequence = (new CodeSequenceRepository())->getLatestCodeByLabel('STOCK_ADJUSTMENT');
            if ($latestCodeSequence == null) {
                $this->errorResponse("Number Sequence not found!");
            }

            // CHECK DUPLICATE STOCK ADJUSTMENT NUMBER
            $checkDuplicateStockAdjustmentNumber = $this->repository->checkStockAdjustmentNumberUnique($latestCodeSequence);
            if ($checkDuplicateStockAdjustmentNumber > 0) {
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

            // Save STOCK ADJUSTMENT Value
            $stockAdjustmentValueResult =  $this->repository->create([
                'stock_adjustment_number' => $latestCodeSequence,
                'branch_id'               => $userData['branch_id'],
                'reason'                  => $formData['reason'],
                'adjustment_type'         => $formData['adjustment_type'],
                'process_status'          => 'SUBMITTED',
            ]);

            if (empty($stockAdjustmentValueResult)) {
                $this->errorResponse("Stock Adjustment Value save fail!");
            }

            if (!isset($this->stockAdjustmentItemRepository)) {
                $this->errorResponse('Stock adjustment Item Repository not defined');
            }

            $stockAdjustmentItemList = !empty($formData['stockAdjustmentItemsList']) ? $formData['stockAdjustmentItemsList'] : null;
            if ($stockAdjustmentItemList) {
                foreach ($stockAdjustmentItemList as $key => $item) {

                    // CHECK STOCK AVAILABILITY FOR DECREASE ADJUSTMENT
                    if ($formData['adjustment_type'] == 'DECREASE') {
                        // STOCK AVAILABILITY CHECKING
                        $requestedAdjustQty = $item['quantity'];
                        $availableStockQty = $this->itemStockRepository->getItemWiseAvailableStockQty(
                            $userData['branch_id'],
                            $item['item_id'],
                            $requestedAdjustQty
                        );

                        if ($availableStockQty < $requestedAdjustQty) {
                            $this->errorResponse("Insufficient stock quantity for {$item['name']}");
                        }
                    }

                    $this->stockAdjustmentItemRepository->create([
                        'stock_adjustment_id' => $stockAdjustmentValueResult['id'],
                        'item_id'             => $item['item_id'],
                        'quantity'            => $item['quantity'],
                        'shelve_id'           => $item['shelve_id'],
                        'remarks'             => $item['remarks']
                    ]);
                }
            }
            // UPDATE STOCK ADJUSTMENT NUMBER
            (new CodeSequenceRepository())->updateNextSequenceByLabel('STOCK_ADJUSTMENT');

            DB::commit();
            $response = isset($this->resource) ? new $this->resource($stockAdjustmentValueResult) : $stockAdjustmentValueResult;
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

            if ($entity->process_status == 'APPROVED') {
                $this->errorResponse('Stock Adjustment is already Approved and cannot be deleted');
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
