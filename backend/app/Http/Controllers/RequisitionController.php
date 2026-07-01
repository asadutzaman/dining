<?php

namespace App\Http\Controllers;

use App\Http\Resources\RequisitionResource;
use App\Repositories\RequisitionRepository;
use App\Traits\Controller\RestControllerTrait;
use App\Validators\RequisitionValidator;
use Dotenv\Exception\ValidationException;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Exceptions\ValidatorException;
use App\Repositories\CodeSequenceRepository;
use App\Repositories\ItemRepository;
use App\Repositories\RequisitionItemRepository;
use App\Services\SessionService;
use Log;

class RequisitionController extends Controller
{
    private $repository;

    private $requisitionItemRepository;

    private $validator;

    private $resource;

    private $partialUpdateFields = ['status'];

    use RestControllerTrait;

    public function __construct(RequisitionRepository $repository, RequisitionValidator $validator, RequisitionItemRepository $requisitionItemRepository)
    {
        $this->repository = $repository;
        $this->validator = $validator;
        $this->resource = RequisitionResource::class;
        $this->requisitionItemRepository = $requisitionItemRepository;
    }

    public function store(Request $request)
    {
        /*
         * STEP-1: GET REQUISITION LATEST CODE
         * STEP-2: STORE REQUISITION DATA
         * STEP-3: STORE REQUISITION ITEM DATA
         * STEP-4: UPDATE CODE SEQUENCE
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

            $requisitionItemList = !empty($formData['requisitionItemsList']) ? $formData['requisitionItemsList'] : null;
            $groupedByLogistic = [];
            if ($requisitionItemList) {
                foreach ($requisitionItemList as $item) {
                    // get logistic id from item
                    $itemData = (new ItemRepository())->findById($item['item_id']);
                    $logisticId = $itemData->logistic_id;
                    if ($logisticId == null) {
                        $this->errorResponse("This {$itemData->name} does not found any logistic!");
                    }
                    if (!isset($groupedByLogistic[$logisticId])) {
                        $groupedByLogistic[$logisticId] = [];
                    }
                    $groupedByLogistic[$logisticId][] = $item;
                }
            }

            // NOW CREATE REQUISITION FOR EACH LOGISTIC
            foreach ($groupedByLogistic as $logisticId => $items) {
                // STEP-1: GET REQUISITION LATEST CODE
                $latestCodeSequence = (new CodeSequenceRepository())->getLatestCodeByLabel('REQUISITION');
                if ($latestCodeSequence == null) {
                    $this->errorResponse("Number Sequence not found!");
                }
                // CHECK DUPLICATE REQUISITION NUMBER
                $checkDuplicateReqNumber = $this->repository->checkReqNumberUnique($latestCodeSequence);
                if ($checkDuplicateReqNumber > 0) {
                    $this->errorResponse("{$latestCodeSequence} - This Number Sequence is already exist!");
                }

                // STEP-2: STORE REQUISITION DATA
                $requisitionValueResult =  $this->repository->create([
                    'requisition_number' => $latestCodeSequence,
                    'branch_id'          => $userData['branch_id'],
                    'logistic_id'        => $logisticId,
                    'subject'            => $formData['subject'],
                    'description'        => $formData['description'] ?? null,
                    'reconcile_status'   => 0,
                    'process_status'     => in_array($formData['process_status'], ['PENDING', 'DRAFT']) ? $formData['process_status'] : 'DRAFT',
                ]);

                if (empty($requisitionValueResult)) {
                    $this->errorResponse("Requisition Value save fail!");
                }

                // STEP-3: STORE REQUISITION ITEM DATA
                foreach ($items as $item) {
                    $this->requisitionItemRepository->create([
                        'requisition_id'    => $requisitionValueResult['id'],
                        'item_id'           => $item['item_id'],
                        'request_quantity'  => $item['request_quantity'],
                        'due_quantity'      => $item['request_quantity'],
                    ]);
                }
                // STEP-4: UPDATE CODE SEQUENCE
                (new CodeSequenceRepository())->updateNextSequenceByLabel('REQUISITION');
            }

            // PREVIOUS CODE
            // // STEP-2: STORE REQUISITION DATA
            // $requisitionValueResult =  $this->repository->create([
            //     'requisition_number' => $latestCodeSequence,
            //     'branch_id'          => $userData['branch_id'],
            //     'logistic_id'        => $formData['logistic_id'],
            //     'subject'            => $formData['subject'],
            //     'description'        => $formData['description'] ?? null,
            //     'reconcile_status'   => 0,
            //     'process_status'     => in_array($formData['process_status'], ['PENDING', 'DRAFT']) ? $formData['process_status'] : 'DRAFT',
            // ]);

            // if (empty($requisitionValueResult)) {
            //     $this->errorResponse("Requisition Value save fail!");
            // }

            // if (!isset($this->requisitionItemRepository)) {
            //     $this->errorResponse('Requisition Item Repository not defined');
            // }

            // // STEP-3: STORE REQUISITION ITEM DATA
            // $requisitionItemList = !empty($formData['requisitionItemsList']) ? $formData['requisitionItemsList'] : null;
            // if ($requisitionItemList) {
            //     foreach ($requisitionItemList as $key => $item) {
            //         // CHECK ITEM EXIST IN THIS LOGISTICS
            //         $checkItemExist = (new ItemRepository())->checkItemExistInLogistics($item['item_id'], $formData['logistic_id']);
            //         if ($checkItemExist == false) {
            //             $this->errorResponse("Remove {$item['name']} - This Item is not in this Logistic!");
            //         }

            //         $this->requisitionItemRepository->create([
            //             'requisition_id'    => $requisitionValueResult['id'],
            //             'item_id'           => $item['item_id'],
            //             'request_quantity'  => $item['request_quantity'],
            //             'due_quantity'      => $item['request_quantity'],
            //         ]);
            //     }
            // }


            DB::commit();
            $response = isset($this->resource) ? new $this->resource($requisitionValueResult) : $requisitionValueResult;
            return $this->successResourceResponse($response);
        } catch (ValidationException $e) {
            DB::rollBack();
            throw new ValidatorException($e);
        } catch (Exception $e) {
            DB::rollBack();
            $this->errorResponse($e->getMessage());
        }
    }

    public function update(Request $request, $id)
    {
        /*
         * STEP-1: UPDATE REQUISITION DATA
         * STEP-2: DELETE NON MATCH DATA
         * STEP-3: CHECK GIVEN ITEM EXIST IN THIS LOGISTICS
         * STEP-4: UPDATE REQUISITION ITEM DATA
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

            // Items updated within same logistic - Update original requisition
            // New item added from different logistic - Create new requisition
            // Item removed from original logistic - Delete from original requisition
            // All items replaced with different logistic - Update original requisition's logistic_id + replace all items
            $requisitionItemList = !empty($formData['requisitionItemsList']) ? $formData['requisitionItemsList'] : null;

            // GET ORIGINAL REQUISITION
            $originalRequisition = $this->repository->findById($id);
            if (empty($originalRequisition)) {
                $this->errorResponse("Requisition not found!");
            }

            if ($requisitionItemList) {
                // GROUP ITEMS BY LOGISTIC
                $groupedByLogistic = [];
                foreach ($requisitionItemList as $item) {
                    $itemData   = (new ItemRepository())->findById($item['item_id']);
                    $logisticId = $itemData->logistic_id;

                    if ($logisticId == null) {
                        $this->errorResponse("This {$itemData->name} does not have any logistic!");
                    }

                    $groupedByLogistic[$logisticId][] = $item;
                }

                // CHECK IF ORIGINAL LOGISTIC STILL HAS ITEMS
                $originalLogisticHasItems = isset($groupedByLogistic[$originalRequisition->logistic_id]);

                if (!$originalLogisticHasItems && count($groupedByLogistic) === 1) {
                    // ALL ITEMS REPLACED WITH A DIFFERENT LOGISTIC
                    // → JUST UPDATE THE ORIGINAL REQUISITION WITH NEW LOGISTIC

                    $newLogisticId = array_key_first($groupedByLogistic);
                    $newItems      = $groupedByLogistic[$newLogisticId];

                    // STEP-1: UPDATE REQUISITION HEADER WITH NEW LOGISTIC
                    $this->repository->update([
                        'logistic_id'    => $newLogisticId,
                        'subject'        => $formData['subject'],
                        'description'    => $formData['description'] ?? null,
                        'process_status' => in_array($formData['process_status'], ['PENDING', 'DRAFT']) ? $formData['process_status'] : 'DRAFT',
                    ], $id);

                    // STEP-2: DELETE ALL OLD ITEMS
                    $this->requisitionItemRepository->newQuery()
                        ->where('requisition_id', $id)
                        ->delete();

                    // STEP-3: INSERT NEW ITEMS
                    foreach ($newItems as $item) {
                        $this->requisitionItemRepository->create([
                            'requisition_id'   => $id,
                            'item_id'          => $item['item_id'],
                            'request_quantity' => $item['request_quantity'],
                            'due_quantity'     => $item['request_quantity'],
                        ]);
                    }
                } else {
                    // NORMAL UPDATE FLOW
                    foreach ($groupedByLogistic as $logisticId => $items) {

                        if ($logisticId == $originalRequisition->logistic_id) {
                            // SAME LOGISTIC → UPDATE ORIGINAL REQUISITION

                            // STEP-1: UPDATE REQUISITION HEADER
                            $this->repository->update([
                                'subject'        => $formData['subject'],
                                'description'    => $formData['description'] ?? null,
                                'process_status' => in_array($formData['process_status'], ['PENDING', 'DRAFT']) ? $formData['process_status'] : 'DRAFT',
                            ], $id);

                            // STEP-2: DELETE REMOVED ITEMS
                            $incomingItemIds = collect($items)->pluck('item_id')->toArray();
                            $this->requisitionItemRepository->newQuery()
                                ->where('requisition_id', $id)
                                ->whereNotIn('item_id', $incomingItemIds)
                                ->delete();

                            // STEP-3: UPDATE OR INSERT ITEMS
                            foreach ($items as $item) {
                                $existingItem = $this->requisitionItemRepository->newQuery()
                                    ->where('requisition_id', $id)
                                    ->where('item_id', $item['item_id'])
                                    ->first();

                                if ($existingItem) {
                                    $this->requisitionItemRepository->update([
                                        'request_quantity' => $item['request_quantity'],
                                        'due_quantity'     => $item['request_quantity'],
                                    ], $existingItem->id);
                                } else {
                                    $this->requisitionItemRepository->create([
                                        'requisition_id'   => $id,
                                        'item_id'          => $item['item_id'],
                                        'request_quantity' => $item['request_quantity'],
                                        'due_quantity'     => $item['request_quantity'],
                                    ]);
                                }
                            }
                        } else {
                            // DIFFERENT LOGISTIC → CREATE NEW REQUISITION

                            $latestCodeSequence = (new CodeSequenceRepository())->getLatestCodeByLabel('REQUISITION');
                            if ($latestCodeSequence == null) {
                                $this->errorResponse("Number Sequence not found!");
                            }

                            $checkDuplicateReqNumber = $this->repository->checkReqNumberUnique($latestCodeSequence);
                            if ($checkDuplicateReqNumber > 0) {
                                $this->errorResponse("{$latestCodeSequence} - This Number Sequence already exists!");
                            }

                            $newRequisition = $this->repository->create([
                                'requisition_number' => $latestCodeSequence,
                                'branch_id'          => $originalRequisition->branch_id,
                                'logistic_id'        => $logisticId,
                                'subject'            => $formData['subject'],
                                'description'        => $formData['description'] ?? null,
                                'reconcile_status'   => 0,
                                'process_status'     => in_array($formData['process_status'], ['PENDING', 'DRAFT']) ? $formData['process_status'] : 'DRAFT',
                            ]);

                            if (empty($newRequisition)) {
                                $this->errorResponse("New Requisition save fail!");
                            }

                            foreach ($items as $item) {
                                $this->requisitionItemRepository->create([
                                    'requisition_id'   => $newRequisition['id'],
                                    'item_id'          => $item['item_id'],
                                    'request_quantity' => $item['request_quantity'],
                                    'due_quantity'     => $item['request_quantity'],
                                ]);
                            }

                            (new CodeSequenceRepository())->updateNextSequenceByLabel('REQUISITION');
                        }
                    }
                }
            }

            // // STEP-1: UPDATE REQUISITION DATA
            // $this->repository->update([
            //     'subject'            => $formData['subject'],
            //     // 'logistic_id'        => $formData['logistic_id'],
            //     'description'        => $formData['description'],
            //     'process_status'     => in_array($formData['process_status'], ['PENDING', 'DRAFT']) ? $formData['process_status'] : 'DRAFT',
            // ], $id);

            // $requisitionItemListListData = !empty($formData['requisitionItemsList']) ? $formData['requisitionItemsList'] : [];
            // if (!empty($requisitionItemListListData)) {
            //     // STEP-2: DELETE NON MATCH DATA
            //     $requisitionItemIds = array_column($requisitionItemListListData, 'id');
            //     if (count($requisitionItemIds) > 0) {
            //         $this->requisitionItemRepository->deleteRequisitionItemByIds($id, $requisitionItemIds);
            //     }
            //     foreach ($requisitionItemListListData as $key => $item) {
            //         // STEP-3: CHECK GIVEN ITEM EXIST IN THIS LOGISTICS
            //         $checkItemExist = (new ItemRepository())->checkItemExistInLogistics($item['item_id'], $formData['logistic_id']);
            //         if ($checkItemExist == false) {
            //             $this->errorResponse("Remove {$item['name']} - This Item is not in this Logistic!");
            //         }

            //         $requisitionItemListData = [
            //             'requisition_id'    => $id,
            //             'item_id'           => $item['item_id'],
            //             'request_quantity'  => $item['request_quantity'],
            //             'due_quantity'      => $item['request_quantity'],
            //         ];

            //         // STEP-4: UPDATE REQUISITION ITEM DATA
            //         if (!empty($item['id'])) {
            //             // UPDATE OLD ONE
            //             $this->requisitionItemRepository->update($requisitionItemListData, $item['id']);
            //         } else {
            //             // CREATE NEW ONE
            //             $this->requisitionItemRepository->create($requisitionItemListData);
            //         }
            //     }
            // }

            DB::commit();
            $result = $this->repository->show($id);
            $response = isset($this->resource) ? new $this->resource($result) : $result;
            return $this->successResourceResponse($response);
        } catch (ValidationException $e) {
            DB::rollBack();
            throw new ValidatorException($e);
        } catch (Exception $e) {
            DB::rollBack();
            $this->errorResponse($e->getMessage());
        }
    }

    // Acknowledge Requisition
    public function acknowledge(Request $request, $id)
    {
        DB::beginTransaction();
        try {
            if (!isset($this->repository)) {
                $this->errorResponse('Repository not defined');
            }

            // Update Requisition Process Status
            $requisitionInfo = $this->repository->show($id);
            if ($requisitionInfo->process_status == 'DISBURSED' && $request->process_status == 1) {
                $this->repository->update([
                    'process_status'     => 'ACKNOWLEDGED',
                ], $id);
            }

            DB::commit();
            $result = $this->repository->show($id);
            $response = isset($this->resource) ? new $this->resource($result) : $result;
            return $this->successResourceResponse($response);
        } catch (Exception $e) {
            DB::rollBack();
            $this->errorResponse($e->getMessage());
            return false;
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
            $allowedProcessStatus = ['DRAFT', 'SUBMITTED'];
            if (!in_array($entity->process_status, $allowedProcessStatus)) {
                $this->errorResponse("This Requisition is {$entity->process_status} and cannot be deleted");
            }

            if (!isset($this->requisitionItemRepository)) {
                $this->errorResponse('Requisition Item Repository not defined');
            }
            $this->requisitionItemRepository->deleteBy('requisition_id', $id);

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

    // Item Wise Disbursement Details
    public function getItemDisbursementDetails(Request $request)
    {
        try {
            $results = $this->requisitionItemRepository->getItemDisbursementDetails($request->all());
            return $this->successResponse([
                'results' => $results,
            ]);
        } catch (\Exception $e) {
            $this->errorResponse($e->getMessage());
        }
    }
}
