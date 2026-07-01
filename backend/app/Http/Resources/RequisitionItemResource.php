<?php

namespace App\Http\Resources;

class RequisitionItemResource extends BaseResource
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
                'requisition_id'    => $this->requisition_id,
                'item_id'           => $this->item_id,
                'request_quantity'  => $this->request_quantity,
                'revised_quantity'  => $this->revised_quantity,
                'due_quantity'      => $this->due_quantity,
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
