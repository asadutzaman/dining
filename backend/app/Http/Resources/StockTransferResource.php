<?php

namespace App\Http\Resources;

use App\Repositories\StockTransferItemRepository;
use App\Repositories\WorkflowRepository;

class StockTransferResource extends BaseResource
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
                'id'                    => $this->id,
                'stock_transfer_number' => $this->stock_transfer_number,
                'transfer_from'         => $this->transfer_from,
                'transfer_to'           => $this->transfer_to,
                'reason'                => $this->reason,
                'process_status'        => $this->process_status,
                'status'                => $this->status,
                'created_by_name'       => $baseData['created_by_name'],
                'updated_by_name'       => $baseData['updated_by_name'],
                'created_at'            => $baseData['created_at'],
                'updated_at'            => $baseData['updated_at'],
            ];

            if ($this->transferFromBranch) {
                $includesData['transfer_from_branch'] = $this->transferFromBranch->name;
            }

            // EXISTING CODE FOR TRANSFER TO BRANCH
            // if ($this->transferToBranch) {
            //     $includesData['transfer_to_branch'] = $this->transferToBranch->name;
            // }

            // NEW CODE FOR TRANFER TO MANY
            if ($this->transfer_to) {
                if (is_array($this->transfer_to)) {
                    $branches = (new \App\Repositories\BranchRepository())->newQuery()->whereIn('id', $this->transfer_to)->get(['id', 'name']);
                    $includesData['transfer_to_branch'] = $branches->map(function ($branch) {
                        return [
                            'branch_id'   => $branch->id,
                            'branch_name' => $branch->name
                        ];
                    });
                } elseif ($this->transferToBranch) {
                    $includesData['transfer_to_branch'] = $this->transferToBranch->name;
                }
            }

            if (!$this->isCollection) {
                $includesData['stockTransferItemsListData'] = (new StockTransferItemRepository())
                    ->newQuery()
                    ->select('id', 'item_id', 'quantity', 'remarks', 'item_id')
                    ->with(['itemInfo:id,name_en,code'])
                    ->where('stock_transfer_id', $this->id)
                    ->get()
                    ->map(function ($item) {
                        $item->name_en = $item->itemInfo->name_en ?? null;
                        $item->name_bn = $item->itemInfo->name_bn ?? null;
                        $item->code = $item->itemInfo->code ?? null;
                        return $item;
                    });

                $workflowData = (new WorkflowRepository())
                    ->newQuery()
                    ->with(['workflowSteps:id,workflow_id,step_key,step_name,step_code,step_type,status'])
                    ->where('type', 'STOCK_TRANSFER')
                    ->first();

                $includesData['workflowData'] = $workflowData;
            }

            return array_merge($data, $includesData);
        } catch (\Exception $e) {
            return parent::toArray($request);
        }
    }
}
