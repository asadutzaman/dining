<?php

namespace App\Http\Resources;

class StockAdjustmentItemResource extends BaseResource
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
                'id'                  => $this->id,
                'stock_adjustment_id' => $this->tistock_adjustment_idtle,
                'item_id'             => $this->item_id,
                'quantity'            => $this->quantity,
                'shelve_id'           => $this->shelve_id,
                'status'              => $this->status,
                'created_by_name'     => $baseData['created_by_name'],
                'updated_by_name'     => $baseData['updated_by_name'],
                'created_at'          => $baseData['created_at'],
                'updated_at'          => $baseData['updated_at'],
            ];
            return array_merge($data, $includesData);
        } catch (\Exception $e) {
            return parent::toArray($request);
        }
    }
}
