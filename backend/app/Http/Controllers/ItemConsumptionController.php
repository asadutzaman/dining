<?php

namespace App\Http\Controllers;

use App\Http\Resources\ItemConsumptionResource;
use App\Http\Resources\ItemStockResource;
use App\Repositories\ItemConsumptionRepository;
use App\Repositories\ItemStockRepository;
use App\Services\SessionService;
use App\Traits\Controller\RestControllerTrait;
use App\Validators\ItemConsumptionValidator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Exceptions\ValidatorException;
use App\Repositories\ItemRepository;
use App\Repositories\ItemStockOutHistoryRepository;
use App\Services\ResourceService;
use Dotenv\Exception\ValidationException;

class ItemConsumptionController extends Controller
{
    private $repository;

    private $validator;

    private $resource;

    private $itemStockRepository;

    private $itemStockOutHistoryRepository;

    private $partialUpdateFields = ['status'];

    use RestControllerTrait;

    public function __construct(
        ItemConsumptionRepository $repository,
        ItemConsumptionValidator $validator,
        ItemStockRepository $itemStockRepository,
        ItemStockOutHistoryRepository $itemStockOutHistoryRepository
    ) {
        $this->repository = $repository;
        $this->validator = $validator;
        $this->itemStockRepository = $itemStockRepository;
        $this->itemStockOutHistoryRepository = $itemStockOutHistoryRepository;
        $this->resource = ItemConsumptionResource::class;
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

            // Get user data from session
            $sessionService = (new SessionService())->init();
            $userData = $sessionService->getUserData();

            $itemConsumptionItemList = !empty($formData['itemConsumptionItemList']) ? $formData['itemConsumptionItemList'] : [];
            if (!empty($itemConsumptionItemList)) {
                foreach ($itemConsumptionItemList as $key => $itemConsumptionItem) {
                    $requestedConsumeQty = $itemConsumptionItem['quantity'];
                    $availableQty = $this->itemStockRepository->getItemWiseAvailableStockQty($userData['branch_id'], $itemConsumptionItem['item_id']);
                    $itemInfo = (new ItemRepository())->findById($itemConsumptionItem['item_id']);
                    if ($availableQty < $requestedConsumeQty) {
                        $this->errorResponse('Insufficient stock for item ID: ' . $itemInfo->name_en);
                    }

                    $result = $this->repository->create([
                        'branch_id' => $userData['branch_id'],
                        'item_id'   => $itemConsumptionItem['item_id'],
                        'remarks'   => $itemConsumptionItem['remarks'],
                        'quantity'  => $requestedConsumeQty,
                    ]);

                    $itemWiseStockList = $this->itemStockRepository->getItemWiseStockList('FIFO', $userData['branch_id'], $itemConsumptionItem['item_id'], $requestedConsumeQty);
                    if (!empty($itemWiseStockList)) {
                        foreach ($itemWiseStockList as $key => $itemStock) {
                            // MATERIAL STOCK OUT HISTORY
                            $itemStockOut = [
                                'branch_id'       => $userData['branch_id'],
                                'item_stock_id'   => $itemStock->id,
                                'item_id'         => $itemStock->item_id,
                                'recordable_id'   => $result['id'],
                                'recordable_type' => "App\Models\ItemConsumption",
                                'action_from'     => 'ITEM_CONSUMPTION',
                                'remarks'         => '',
                            ];

                            if ($requestedConsumeQty <= $itemStock->balance_quantity) {
                                // MATERIAL STOCK - ADJUST THE STOCK BALANCE QUANTITY
                                $this->itemStockRepository->update([
                                    'balance_quantity' => $itemStock->balance_quantity - $requestedConsumeQty,
                                ], $itemStock->id);
                                // MATERIAL STOCK OUT HISTORY - STOCK OUT
                                $itemStockOut['quantity'] = $requestedConsumeQty;
                                $this->itemStockOutHistoryRepository->create($itemStockOut);
                                break;
                            } else {
                                // MATERIAL STOCK - ADJUST THE STOCK BALANCE QUANTITY
                                $this->itemStockRepository->update([
                                    'balance_quantity' => 0,
                                ], $itemStock->id);
                                $requestedConsumeQty -= $itemStock->balance_quantity;

                                // MATERIAL STOCK OUT HISTORY - STOCK OUT
                                $itemStockOut['quantity'] = $itemStock->balance_quantity;
                                $this->itemStockOutHistoryRepository->create($itemStockOut);
                            }
                        }
                    } else {
                        $this->errorResponse('Insufficient stock for item ID: ' . $itemInfo->name_en);
                    }
                }
            }

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

    public function getBranchItemStock()
    {
        try {
            // Get user data from session
            $sessionService = (new SessionService())->init();
            $userData = $sessionService->getUserData();

            if (!isset($userData['branch_id'])) {
                $this->errorResponse('Branch ID not found');
            }

            $branchId = $userData['branch_id'];

            // Get item stocks for the branch
            $itemStockList = $this->itemStockRepository->getItemStockByBranch($branchId);
            $data['results'] = ResourceService::getResourceCollection($itemStockList, ItemStockResource::class);
            return $data;
        } catch (\Exception $e) {
            $this->errorResponse($e->getMessage());
        }
    }
}
