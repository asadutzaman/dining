<?php

namespace App\Http\Resources;

class RequisitionItemLimitResource extends BaseResource
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
                'designation_id'  => $this->designation_id,
                'item_id'         => $this->item_id,
                'limit_type'      => $this->limit_type,
                'max_qty'         => $this->max_qty,
                'effective_from'  => $this->effective_from,
                'status'          => $this->status,
                'created_by_name' => $baseData['created_by_name'],
                'updated_by_name' => $baseData['updated_by_name'],
                'created_at'      => $baseData['created_at'],
                'updated_at'      => $baseData['updated_at'],
            ];
            if ($this->designation) {
                $includesData['designation_title'] = $this->designation->title;
            }
            if ($this->item) {
                $includesData['item_name'] = $this->item->name_en;
                $includesData['item_code'] = $this->item->code;
            }
            return array_merge($data, $includesData);
        } catch (\Exception $e) {
            return parent::toArray($request);
        }
    }

}
