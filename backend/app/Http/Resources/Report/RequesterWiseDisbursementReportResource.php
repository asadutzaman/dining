<?php

namespace App\Http\Resources\Report;

use App\Http\Resources\BaseResource;

class RequesterWiseDisbursementReportResource extends BaseResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        $defaultData = [];

        $data = [
            'requester_id'        => $this->requester_id,
            'requisition_no'      => $this->requisition_no,
            'item_id'             => $this->item_id,
            'item_name_en'        => "[{$this->code}]-{$this->name_en}",
            'item_name_bn'        => "[{$this->code}]-{$this->name_bn}",
            'unit'                => $this->unit,
            'requester_name'      => $this->requester_name,
            'dmp_unit'            => $this->dmp_unit,
            'designation'         => $this->designation,
            'total_requested_qty' => $this->total_requested_qty,
            'total_received_qty'  => $this->total_received_qty,
            'last_received_date'  => $this->last_received_date,
        ];

        return array_merge($data, $defaultData);
    }
}
