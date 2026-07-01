<?php

namespace App\Http\Resources\Report;

use App\Http\Resources\BaseResource;

class ItemLowStockReportResource extends BaseResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        // return parent::toArray($request);

        $defaultData = [];
        $data = [
            'id'             => $this->id,
            'item_id'        => $this->item_id,
            'item_name_en'   =>  "[{$this->code}]-{$this->name_en}",
            'item_name_bn'   =>  "[{$this->code}]-{$this->name_bn}",
            'logistic_name'  => $this->logistic_name ?? '',
            'stock_qty'      => $this->stock_qty,
            'demand_qty'     => $this->demand_qty,
            'gap_qty'        => $this->gap_qty <= 0 ? 0 : $this->gap_qty,
            'is_risk'        => $this->gap_qty <= 0 ? 0 : ($this->gap_qty > $this->reorder_qty ? 1 : 0),
            'stock_status'   => $this->stock_status,
            // 'stock_status'   => $this->gap_qty <= 0 ? 'Safe' : ($this->gap_qty >= $this->reorder_qty ? 'Critical' : 'Low'),
            'reorder_qty'    => $this->reorder_qty,
            'action_from'    => $this->action_from,
        ];
        return array_merge($data, $defaultData);
    }
}
