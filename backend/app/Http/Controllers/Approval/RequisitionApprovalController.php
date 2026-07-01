<?php

namespace App\Http\Controllers\Approval;

use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use App\Http\Resources\Approval\RequisitionApprovalResource;
use App\Repositories\RequisitionItemRepository;
use App\Repositories\Approval\RequisitionApprovalRepository;
use App\Repositories\BranchRepository;
use App\Repositories\ItemRepository;
use App\Repositories\ItemStockOutHistoryRepository;
use App\Repositories\DisbursementSlotRepository;
use App\Repositories\DisbursementSlotAssignRepository;
use App\Repositories\ItemStockRepository;
use App\Repositories\GovtHolidayRepository;
use App\Traits\Controller\RestControllerTrait;
use Carbon\Carbon;
use App\Repositories\ApplicationSettingRepository;

class RequisitionApprovalController extends Controller
{
    private $repository;

    private $requisitionItemRepository;

    private $itemStockRepository;

    private $itemStockOutHistoryRepository;

    protected $applicationSettingRepository;

    private $disbursementSlotRepository;

    private $disbursementSlotAssignRepository;

    private $govtHolidayRepository;


    private $validator;

    private $resource;

    private $partialUpdateFields = ['status'];

    use RestControllerTrait;

    public function __construct(
        RequisitionApprovalRepository $repository,
        RequisitionItemRepository $requisitionItemRepository,
        ItemStockRepository $itemStockRepository,
        ItemStockOutHistoryRepository $itemStockOutHistoryRepository,
        ApplicationSettingRepository $applicationSettingRepository,
        DisbursementSlotRepository $disbursementSlotRepository,
        DisbursementSlotAssignRepository $disbursementSlotAssignRepository,
        GovtHolidayRepository $govtHolidayRepository
    ) {
        $this->repository = $repository;
        $this->resource = RequisitionApprovalResource::class;
        $this->requisitionItemRepository = $requisitionItemRepository;
        $this->itemStockRepository = $itemStockRepository;
        $this->itemStockOutHistoryRepository = $itemStockOutHistoryRepository;
        $this->applicationSettingRepository = $applicationSettingRepository;
        $this->disbursementSlotRepository = $disbursementSlotRepository;
        $this->disbursementSlotAssignRepository = $disbursementSlotAssignRepository;
        $this->govtHolidayRepository = $govtHolidayRepository;
    }

    public function workflowProcess($updateFields, $id)
    {
        DB::beginTransaction();
        try {
            if (!isset($this->repository)) {
                $this->errorResponse('Repository not defined');
            }

            // approved
            if (!empty($updateFields['process_status']) && $updateFields['process_status'] == 'APPROVED') {
                $response = $this->assignSlot($id);
                if ($response['error_status'] == true) {
                    $this->errorResponse($response['message']);
                }
            }

            if (!empty($updateFields['process_status']) && $updateFields['process_status'] == 'DISBURSED') {
                $response = $this->disburseItem($id);
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
            DB::rollback();
            $this->errorResponse($e->getMessage());
            return false;
        }
    }

    public function updateReviseQuantity($formData, $id)
    {
        DB::beginTransaction();
        try {
            if (!isset($this->repository)) {
                $this->errorResponse('Repository not defined');
            }

            // Update Requisition Process Status
            $this->repository->update($formData['update_fields'], $id);

            $requisitionItemsListData = !empty($formData['to_do_data']) ? $formData['to_do_data'] : [];
            if (!empty($requisitionItemsListData)) {
                foreach ($requisitionItemsListData as $key => $item) {
                    if (!empty($item['id'])) {
                        // UPDATE REVISED QTY
                        $this->requisitionItemRepository->update([
                            'revised_quantity' => $item['revised_quantity'],
                        ], $item['id']);
                    }
                }
            }

            DB::commit();
            $response = 'Workflow process successfully';
            return $this->successResponse($response);
        } catch (Exception $e) {
            DB::rollback();
            $this->errorResponse($e->getMessage());
            return false;
        }
    }

    private function disburseItem($requisitionId)
    {
        /**
         * STEP-1: WAREHOUSE ITEM STOCK CHECKING
         * STEP-2: INSERT WAREHOUSE ITEM STOCK OUT HISTORY
         * STEP-3: UPDATE WAREHOUSE ITEM STOCK BALANCE QUANTITY
         * STEP-4: INSERT INTO BRANCH STOCK FROM WAREHOUSE
         */
        $response = [
            'error_status' => false,
            'message'      => "",
        ];
        $requisitionInfo = $this->repository->findById($requisitionId);
        $requisitionItemList = $this->requisitionItemRepository->findWhere('requisition_id', $requisitionId);
        $warehouseInfo = (new BranchRepository())->getWarehouseInfo();

        if (!empty($requisitionItemList) && !empty($warehouseInfo)) {
            foreach ($requisitionItemList as $key => $requisitionItem) {
                // STEP-1: WAREHOUSE ITEM STOCK CHECKING
                $requestedDisburseQty = $requisitionItem->revised_quantity == null ? $requisitionItem->request_quantity : $requisitionItem->revised_quantity;
                $availableStockQty = $this->itemStockRepository->getItemWiseAvailableStockQty($warehouseInfo->id, $requisitionItem->item_id);
                if ($availableStockQty < $requestedDisburseQty) {
                    $itemInfo = (new ItemRepository())->findById($requisitionItem->item_id);
                    $response['error_status'] = true;
                    $response['message'] = "Insufficient quantity for {$itemInfo->code}";
                }

                $itemWiseStockList = $this->itemStockRepository->getItemWiseStockList('FIFO', $warehouseInfo->id, $requisitionItem->item_id, $requestedDisburseQty);
                if (!empty($itemWiseStockList)) {
                    foreach ($itemWiseStockList as $key => $itemStock) {
                        // STEP-2: INSERT WAREHOUSE ITEM STOCK OUT HISTORY
                        $itemStockOut = [
                            'branch_id'       => $warehouseInfo->id,
                            'item_stock_id'   => $itemStock->id,
                            'item_id'         => $itemStock->item_id,
                            'recordable_id'   => $requisitionItem->id,
                            'recordable_type' => "App\Models\RequisitionItem",
                            'action_from'     => 'REQUISITION',
                            'remarks'         => '',
                        ];

                        if ($requestedDisburseQty <= $itemStock->balance_quantity) {
                            // STEP-3: UPDATE WAREHOUSE ITEM STOCK BALANCE QUANTITY
                            $this->itemStockRepository->update([
                                'balance_quantity' => $itemStock->balance_quantity - $requestedDisburseQty,
                            ], $itemStock->id);
                            // STEP-2: INSERT WAREHOUSE ITEM STOCK OUT HISTORY
                            $itemStockOut['quantity'] = $requestedDisburseQty;
                            $this->itemStockOutHistoryRepository->create($itemStockOut);
                            break;
                        } else {
                            // STEP-3: UPDATE WAREHOUSE ITEM STOCK BALANCE QUANTITY
                            $this->itemStockRepository->update([
                                'balance_quantity' => 0,
                            ], $itemStock->id);
                            $requestedDisburseQty -= $itemStock->balance_quantity;

                            // STEP-2: INSERT WAREHOUSE ITEM STOCK OUT HISTORY
                            $itemStockOut['quantity'] = $itemStock->balance_quantity;
                            $this->itemStockOutHistoryRepository->create($itemStockOut);
                        }
                    }

                    // STEP-4: INSERT INTO BRANCH STOCK FROM WAREHOUSE
                    $this->itemStockRepository->create([
                        'branch_id'        => $requisitionInfo->branch_id,
                        'item_id'          => $requisitionItem->item_id,
                        'shelve_id'        => null,
                        'unit_price'       => $requisitionItem->unit_price,
                        'quantity'         => $requestedDisburseQty,
                        'balance_quantity' => $requestedDisburseQty,
                        'recordable_id'    => $requisitionItem->id,
                        'recordable_type'  => 'App\Models\RequisitionItem',
                        'action_from'      => 'Material_Requisition',
                        'remarks'          => "Requisition-Disbursement/{$requisitionInfo->requisition_number}",
                    ]);
                }
            }
        } else {
            $response['error_status'] = true;
            $response['message'] = 'Requisition item not found for disbursement';
        }
        return $response;
    }

    private function assignSlot($requisitionId)
    {
        /**
         * CONDITIONS:
         * 1. Check Holiday (if holiday, skip to next day)
         * 2. Check Daily Assignment Limit (if limit reached, skip to next day)
         * 3. Check for Existing Available Slot (if slot available, assign)
         * 4. Check Daily Slot Limit (if limit reached, skip to next day)
         * 5. Determine Time (assign slot based on time priority)
         *
         * STEP-1: CREATE DISBURSEMENT SLOT
         * STEP-2: ASSIGN DISBURSEMENT SLOT
         */
        DB::beginTransaction();
        $response = [
            'error_status' => false,
            'message'      => "",
        ];
        $requisitionInfo = $this->repository->findById($requisitionId);
        if (!empty($requisitionInfo)) {
            $date = Carbon::now()->addDay();
            $slotSettings = $this->applicationSettingRepository->getApplicationSettings([
                'office_start_time',
                'office_end_time',
                'slot_duration',
                'slot_capacity', // assign_capacity
                'daily_slot_quantity_limit',
                'daily_assign_slot_quantity_limit',
            ]);

            if (empty($slotSettings)) {
                DB::rollback();
                $response['error_status'] = true;
                $response['message'] = 'Slot settings not found';
                return $response;
            }
            $officeStartTime = $slotSettings['office_start_time'];
            $officeEndTime = $slotSettings['office_end_time'];
            $duration = (int) $slotSettings['slot_duration'];
            $assignCapacity = (int) $slotSettings['slot_capacity'];
            $dailySlotQtyLimit = (int) $slotSettings['daily_slot_quantity_limit'];
            $dailyAssignSlotQtyLimit = (int) $slotSettings['daily_assign_slot_quantity_limit'];

            $slotFound = false;
            $slotInfo = null;

            while (!$slotFound) {
                $formattedDate = $date->format('Y-m-d');

                // 1. Check Holiday
                $isHoliday = $this->govtHolidayRepository->newQuery()
                    ->where('date', $formattedDate)
                    ->exists();

                // If holiday, skip to next day
                if ($isHoliday) {
                    $date->addDay();
                    continue;
                }

                // 2. Check Daily Assignment Limit
                $dailyAssignmentCount = $this->disbursementSlotAssignRepository->newQuery()
                    ->whereHas('disbursementSlot', function ($q) use ($formattedDate) {
                        $q->where('date', $formattedDate);
                    })
                    ->count();

                // Check if daily assignment limit is reached
                if ($dailyAssignmentCount >= $dailyAssignSlotQtyLimit) {
                    $date->addDay();
                    continue;
                }

                // 3. Check for Existing Available Slot
                $existingSlot = $this->disbursementSlotRepository->newQuery()
                    ->where('date', $formattedDate)
                    ->where('remaining_assign_capacity', '>', 0)
                    ->orderBy('start_time', 'asc')
                    ->first();

                // If existing slot found, assign to requisition
                if ($existingSlot) {
                    $slotInfo = $existingSlot;
                    $slotFound = true;
                    break;
                }

                // 4. Check Daily Slot Limit
                $slotCount = $this->disbursementSlotRepository->newQuery()
                    ->where('date', $formattedDate)
                    ->count();

                // Check if daily slot quantity limit is reached
                if ($slotCount >= $dailySlotQtyLimit) {
                    $date->addDay();
                    continue;
                }

                // 5. Determine Time
                $lastSlot = $this->disbursementSlotRepository->newQuery()
                    ->where('date', $formattedDate)
                    ->orderBy('end_time', 'desc')
                    ->first();

                if ($lastSlot) {
                    // Set slot start time from last slot end time
                    $lastEndTime = Carbon::parse($lastSlot->end_time);
                    $startTime = $date->copy()->setTime($lastEndTime->hour, $lastEndTime->minute, $lastEndTime->second);
                } else {
                    // Set slot Start Time from Office Start Time
                    $configStartTime = Carbon::parse($officeStartTime);
                    $startTime = $date->copy()->setTime($configStartTime->hour, $configStartTime->minute, $configStartTime->second);
                }
                // Set slot End Time by adding duration from Start Time
                $endTime = $startTime->copy()->addMinutes($duration);

                // Format office End Time for comparison with slot End Time
                $officeEndTime = Carbon::parse($officeEndTime);
                $limitEndTime = $date->copy()->setTime($officeEndTime->hour, $officeEndTime->minute, $officeEndTime->second);

                // Check if slot End Time exceeds office End Time
                if ($endTime->gt($limitEndTime)) {
                    $date->addDay();
                    continue;
                }

                // Create Slot
                try {
                    $slotInfo = $this->disbursementSlotRepository->create([
                        'date'                      => $formattedDate,
                        'start_time'                => $startTime->format('H:i'),
                        'end_time'                  => $endTime->format('H:i'),
                        'assign_capacity'           => $assignCapacity,
                        'remaining_assign_capacity' => $assignCapacity,
                        'slot_duration'             => $duration,
                    ]);
                    $slotFound = true;
                } catch (Exception $e) {
                    DB::rollback();
                    $response['error_status'] = true;
                    $response['message'] = $e->getMessage();
                    break;
                }
            }

            if ($slotInfo) {
                $this->disbursementSlotAssignRepository->create([
                    'disbursement_slot_id' => $slotInfo->id,
                    'requisition_id' => $requisitionId
                ]);

                // Update Remaining Capacity
                $this->disbursementSlotRepository->update([
                    'remaining_assign_capacity' => $slotInfo->remaining_assign_capacity - 1
                ], $slotInfo->id);
            }
        }
        DB::commit();
        return $response;
    }
}
