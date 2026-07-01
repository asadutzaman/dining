<?php

namespace App\Http\Resources;

class GoodsReceiveNoteItemResource extends BaseResource
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
                'id'                     => $this->id,
                'goods_receive_note_id'   => $this->goods_receive_note_id,
                'item_id'                => $this->item_id,
                'unit_price'             => $this->unit_price,
                'quantity'               => $this->quantity,
                'total_price'            => $this->total_price,
                'shelve_id'              => $this->shelve_id,
                'remarks'                => $this->remarks,
                'status'                 => $this->status,
                'created_by_name'        => $baseData['created_by_name'],
                'updated_by_name'        => $baseData['updated_by_name'],
                'created_at'             => $baseData['created_at'],
                'updated_at'             => $baseData['updated_at'],
            ];
            return array_merge($data, $includesData);
        } catch (\Exception $e) {
            return parent::toArray($request);
        }
    }
}
