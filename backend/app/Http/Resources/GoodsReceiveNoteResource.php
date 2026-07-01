<?php

namespace App\Http\Resources;

use App\Repositories\GoodsReceiveNoteItemRepository;

class GoodsReceiveNoteResource extends BaseResource
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
                'id'               => $this->id,
                'grn_number'       => $this->grn_number,
                'branch_id'        => $this->branch_id,
                'logistic_id'      => $this->logistic_id,
                'ref_po_number'    => $this->ref_po_number,
                'ref_po_date'      => $this->ref_po_date,
                'ref_challan_no'   => $this->ref_challan_no,
                'ref_challan_date' => $this->ref_challan_date,
                'received_date'    => $this->received_date,
                'process_status'   => $this->process_status,
                'remarks'          => $this->remarks,
                'status'           => $this->status,
                'created_at'      => $this->created_at,
                'updated_at'      => $this->updated_at,
                'created_by_name'  => $baseData['created_by_name'],
                'updated_by_name'  => $baseData['updated_by_name'],
                'created_at'      => $baseData['created_at'],
                'updated_at'      => $baseData['updated_at'],
            ];

            if ($this->logistic) {
                $includesData['logistic_name'] = $this->logistic->name;
            }
            if ($this->branch) {
                $includesData['branch_name'] = $this->branch->name;
            }

            if (!$this->isCollection) {
                $includesData['goods_receive_note_items_list_data'] = (new GoodsReceiveNoteItemRepository())
                    ->newQuery()
                    ->select('id', 'unit_price', 'quantity', 'total_price', 'shelve_id', 'remarks', 'item_id', 'expire_date')
                    ->with([
                        'itemInfo:id,name_en,name_bn,code',
                        'shelveInfo:id,name',
                    ])
                    ->where('goods_receive_note_id', $this->id)
                    ->get();
            }

            return array_merge($data, $includesData);
        } catch (\Exception $e) {
            return parent::toArray($request);
        }
    }
}
