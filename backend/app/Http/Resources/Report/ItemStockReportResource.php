<?php

namespace App\Http\Resources\Report;

use App\Http\Resources\BaseResource;
use App\Repositories\ItemStockRepository;

class ItemStockReportResource extends BaseResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        // $defaultData = [];
        $baseData = parent::toArray($request);

        $data = [
            'id'                 => $this->id,
            'item_id'            => $this->item_id,
            'item_name_en'       => "[{$this->code}]-{$this->name_en}",
            'item_name_bn'       => "[{$this->code}]-{$this->name_bn}",
            'category_name'      => $this->category_name,
            'unit_name'          => $this->unit_name,
            'total_grn_qty'      => $this->total_grn_qty,
            'total_disburse_qty' => $this->total_disburse_qty,
            'current_stock'      => $this->current_stock,
            'running_demand'     => $this->running_demand,
            'demand_stock_gap'   => $this->demand_stock_gap,
            'risk_status'        => $this->risk_status,
            'last_grn_date'      => $this->last_grn_date,
            'last_disburse_date' => $this->last_disburse_date,
            'total_grn_qty'      => $this->total_grn_qty,
        ];

        $includesData = [];
        return array_merge($data, $includesData);
    }
}
