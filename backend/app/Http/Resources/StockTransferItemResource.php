<?php

namespace App\Http\Resources;

class StockTransferItemResource extends BaseResource
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
                'id'                => $this->id,
                'stock_transfer_id' => $this->stock_transfer_id,
                'item_id'           => $this->item_id,
                'item_name_en'      => "[{$this->itemInfo->code}]-{$this->itemInfo->name_en}",
                'item_name_bn'      => "[{$this->itemInfo->code}]-{$this->itemInfo->name_bn}",
                'quantity'          => $this->quantity,
                'remarks'           => $this->remarks,
                'status'            => $this->status,
                'created_by_name'   => $baseData['created_by_name'],
                'updated_by_name'   => $baseData['updated_by_name'],
                'created_at'        => $baseData['created_at'],
                'updated_at'        => $baseData['updated_at'],
            ];

            return array_merge($data, $includesData);
        } catch (\Exception $e) {
            return parent::toArray($request);
        }
    }
}
