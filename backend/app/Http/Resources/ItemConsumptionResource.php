<?php

namespace App\Http\Resources;

use App\Repositories\BranchRepository;
use App\Repositories\ItemRepository;

class ItemConsumptionResource extends BaseResource
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

            $data = [
                'id'              => $this->id,
                'branch_id'       => $this->branch_id,
                'item_id'         => $this->item_id,
                'quantity'        => $this->quantity,
                'remarks'         => $this->remarks,
                'status'          => $this->status,
                'created_by_name' => $baseData['created_by_name'],
                'updated_by_name' => $baseData['updated_by_name'],
                'created_at'      => $baseData['created_at'],
                'updated_at'      => $baseData['updated_at'],
            ];

            $includesData = [];
            if ($this->item_id) {
                $itemInfo = (new ItemRepository())->findById($this->item_id);
                $includesData['item_name_en'] = $itemInfo->name_en;
                $includesData['item_name_bn'] = $itemInfo->name_bn;
            }

            if ($this->branch_id) {
                $branchInfo = (new BranchRepository())->findById($this->branch_id);
                $includesData['branch_name'] = $branchInfo->name;
            }

            return array_merge($data, $includesData);
        } catch (\Exception $e) {
            return parent::toArray($request);
        }
    }
}
