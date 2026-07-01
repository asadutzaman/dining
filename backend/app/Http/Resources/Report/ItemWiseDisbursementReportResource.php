<?php

namespace App\Http\Resources\Report;

use App\Http\Resources\BaseResource;
use Illuminate\Http\Request;

class ItemWiseDisbursementReportResource extends BaseResource
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
            $data = [
                'requester_id'        => $this->requester_id,
                'requester_name'      => $this->requester_name,
                'item_id'             => $this->item_id,
                'item_name_en'        => "[{$this->code}]-{$this->name_en}",
                'item_name_bn'        => "[{$this->code}]-{$this->name_bn}",
                'dmp_unit'            => $this->dmp_unit,
                'no_of_requisitions'  => $this->no_of_requisitions,
                'requisition_nos'     => $this->requisition_nos,
                'total_requested_qty' => $this->total_requested_qty,
                'total_received_qty'  => $this->total_received_qty,
                'last_received_date'  => $this->last_received_date,
            ];

            return $data;
        } catch (\Exception $e) {
            return parent::toArray($request);
        }
    }
}
