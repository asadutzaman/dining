<?php

namespace App\Http\Resources;

use App\Repositories\DisbursementSlotAssignRepository;
use App\Repositories\ItemStockRepository;
use App\Repositories\RequisitionItemRepository;
use App\Repositories\WorkflowRepository;

class RequisitionResource extends BaseResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        try {
            $baseData = parent::toArray($request);

            $includesData = [];
            $data = [
                'id'                 => $this->id,
                'requisition_number' => $this->requisition_number,
                'branch_id'          => $this->branch_id,
                'logistic_id'        => $this->logistic_id,
                'subject'            => $this->subject,
                'description'        => $this->description,
                'reconcile_status'   => $this->reconcile_status,
                'process_status'     => $this->process_status,
                'status'             => $this->status,
                'created_by'         => $this->created_by,
                'created_by_name'    => $baseData['created_by_name'],
                'updated_by_name'    => $baseData['updated_by_name'],
                'created_at'         => $baseData['created_at'],
                'updated_at'         => $baseData['updated_at'],
                'created_by_designation' => $baseData['created_by_designation'],
            ];


            if ($this->logistic) {
                $includesData['logistic_name'] = $this->logistic->name;
            }
            if ($this->branch) {
                $includesData['branch_name'] = $this->branch->name;
            }

            if (!$this->isCollection) {
                $includesData['requisitionItemsListData'] = (new RequisitionItemRepository())
                    ->newQuery()
                    ->select('id', 'request_quantity', 'revised_quantity', 'due_quantity', 'item_id', 'remarks')
                    ->with(['itemInfo:id,name_en,code,type'])
                    ->where('requisition_id', $this->id)
                    ->get();
                // ->map(function ($item) {
                //     $item->name_en = $item->itemInfo->name_en ?? null;
                //     $item->name_bn = $item->itemInfo->name_bn ?? null;
                //     $item->code = $item->itemInfo->code ?? null;
                //     return $item;
                // });

                // GET RECEIPTS LAST MONTH
                foreach ($includesData['requisitionItemsListData'] as $item) {
                    $item->name_en = $item->itemInfo->name_en ?? null;
                    $item->name_bn = $item->itemInfo->name_bn ?? null;
                    $item->code = $item->itemInfo->code ?? null;
                    $item->receipts_last_month = (new ItemStockRepository())
                        ->newQuery()
                        ->where('item_id', $item->item_id)
                        ->where('branch_id', $this->branch_id)
                        ->where('created_at', '>=', now()->subMonth()->startOfMonth()->format('Y-m-d'))
                        ->where('created_at', '<=', now()->subMonth()->endOfMonth()->format('Y-m-d'))
                        ->sum('quantity') ?? 0;
                }

                // GET WORKFLOW DATA
                $workflowData = (new WorkflowRepository())
                    ->newQuery()
                    ->with(['workflowSteps:id,workflow_id,step_key,step_name,step_code,step_type,status'])
                    ->where('type', 'Requisition')
                    ->first();

                $includesData['workflowData'] = $workflowData;

                // GET DISBURSEMENT SLOT ASSIGN
                if ($this->id && $this->process_status == 'APPROVED' || $this->process_status == 'DISBURSED') {
                    $disbursementSlotAssign = (new DisbursementSlotAssignRepository())->newQuery()
                        ->with(['disbursementSlot:id,date,start_time,end_time'])
                        ->where('requisition_id', $this->id)
                        ->first();
                    if ($disbursementSlotAssign) {
                        $includesData['disbursement_date'] = $disbursementSlotAssign->disbursementSlot->date->format('Y-m-d');
                        $includesData['disbursement_start_time'] = $disbursementSlotAssign->disbursementSlot->start_time->format('H:i A');
                        $includesData['disbursement_end_time'] = $disbursementSlotAssign->disbursementSlot->end_time->format('H:i A');
                    } else {
                        $includesData['disbursement_date'] = null;
                        $includesData['disbursement_start_time'] = null;
                        $includesData['disbursement_end_time'] = null;
                    }
                }
            }

            return array_merge($data, $includesData);
        } catch (\Exception $e) {
            return parent::toArray($request);
        }
    }
}
