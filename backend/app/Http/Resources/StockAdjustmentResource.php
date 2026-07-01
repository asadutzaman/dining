<?php

namespace App\Http\Resources;

use App\Repositories\StockAdjustmentItemRepository;

class StockAdjustmentResource extends BaseResource
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
                'id'                      => $this->id,
                'stock_adjustment_number' => $this->stock_adjustment_number,
                'branch_id'               => $this->branch_id,
                'reason'                  => $this->reason,
                'adjustment_type'         => $this->adjustment_type,
                'process_status'          => $this->process_status,
                'status'                  => $this->status,
                'created_by_name'         => $baseData['created_by_name'],
                'updated_by_name'         => $baseData['updated_by_name'],
                'created_at'              => $baseData['created_at'],
                'updated_at'              => $baseData['updated_at'],
            ];

            if ($this->branch) {
                $includesData['branch_name'] = $this->branch->name;
            }

            if (!$this->isCollection) {
                $includesData['stock_adjustment_items_list_data'] = (new StockAdjustmentItemRepository())
                    ->newQuery()
                    ->select('quantity', 'shelve_id', 'remarks', 'item_id')
                    ->with(['itemInfo:id,name_en,name_bn,code'])
                    ->where('stock_adjustment_id', $this->id)
                    ->get();
            }

            return array_merge($data, $includesData);
        } catch (\Exception $e) {
            return parent::toArray($request);
        }
    }
}
