<?php

namespace App\Http\Resources;

class ItemStockResource extends BaseResource
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
                'id'                     => $this->id,
                'item_id'                => $this->item_id,
                'item_type'              => $this->itemInfo->type ?? '',
                'item_name_en'           =>  "[{$this->itemInfo->code}]-{$this->itemInfo->name_en}",
                'item_name_bn'           =>  "[{$this->itemInfo->code}]-{$this->itemInfo->name_bn}",
                'logistic_id'            => $this->itemInfo->logistic_id,
                'logistic_name'          => $this->itemInfo->logisticInfo->name ?? '',
                'branch_id'              => $this->branch_id,
                'branch_name'            => $this->branchInfo->name ?? '',
                'shelve_id'              => $this->shelve_id,
                'shelve_name'            => $this->shelveInfo->name ?? '',
                'balance_quantity'       => $this->balance_quantity,
                'created_at'             => $baseData['created_at'],
                'updated_at'             => $baseData['updated_at'],

            ];

            $includesData = [];

            return array_merge($data, $includesData);
        } catch (\Exception $e) {
            return parent::toArray($request);
        }
    }
}
