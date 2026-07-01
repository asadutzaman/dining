<?php

namespace App\Http\Resources;

class ItemStockOutHistoryResource extends BaseResource
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
                'id'              => $this->id,
                'recordable_id'   => $this->recordable_id,
                'recordable_type' => $this->recordable_type,
                'item_stock_id'   => $this->item_stock_id,
                'item_id'         => $this->item_id,
                'quantity'        => $this->quantity,
                'action_from'     => $this->action_from,
                'remarks'         => $this->remarks,
                'status'          => $this->status,
                'created_by_name' => $baseData['created_by_name'],
                'updated_by_name' => $baseData['updated_by_name'],
                'created_at'      => $baseData['created_at'],
                'updated_at'      => $baseData['updated_at'],
            ];
            return array_merge($data, $includesData);
        } catch (\Exception $e) {
            return parent::toArray($request);
        }
    }
}
