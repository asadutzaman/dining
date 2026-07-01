<?php

namespace App\Http\Resources;

use App\Repositories\ItemAttributeRepository;
use App\Repositories\UnitMappingRepository;

class ItemResource extends BaseResource
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

            $data = [
                'id'               => $this->id,
                'name_en'          => $this->name_en,
                'name_bn'          => $this->name_bn,
                'type'             => $this->type,
                'code'             => $this->code,
                'reorder_qty'      => $this->reorder_qty,
                'description'      => $this->description,
                'logistic_id'      => $this->logistic_id,
                'item_category_id' => $this->item_category_id,
                'brand_id'         => $this->brand_id,
                'base_unit_id'     => $this->base_unit_id,
                'status'           => $this->status,
                'created_at'       => $this->created_at,
                'updated_at'       => $this->updated_at,
                'created_by_name'  => $baseData['created_by_name'],
                'updated_by_name'  => $baseData['updated_by_name'],
            ];

            $includesData = [];
            if ($this->logistic) {
                $includesData['logistic_name'] = $this->logistic->name;
            }
            if ($this->itemCategory) {
                $includesData['item_category_name'] = $this->itemCategory->name;
            }
            if ($this->brand) {
                $includesData['brand_name'] = $this->brand->name;
            }
            if ($this->baseUnit) {
                $includesData['base_unit_sort_name'] = $this->baseUnit->short_name;
            }

            if (!$this->isCollection) {
                $data['item_attributes'] = (new ItemAttributeRepository())
                    ->newQuery()
                    ->select('id', 'item_id', 'attribute_id', 'attribute_value_id')
                    ->with([
                        'attribute:id,name',
                        'attributeValue:id,value'
                    ])
                    ->where('item_id', $this->id)
                    ->get()
                    ->map(function ($itemAttribute) {
                        $itemAttribute->attribute_name = $itemAttribute->attribute->name ?? null;
                        $itemAttribute->attribute_value_name = $itemAttribute->attributeValue->value ?? null;
                        return $itemAttribute;
                    });

                $data['item_unit_mappings'] = (new UnitMappingRepository())
                    ->newQuery()
                    ->select('id', 'item_id', 'unit_id', 'conversion_to_base')
                    ->with([
                        'unit:id,name,short_name'
                    ])
                    ->where('item_id', $this->id)
                    ->get()
                    ->map(function ($unitMapping) {
                        $unitMapping->unit_name = $unitMapping->unit->name ?? null;
                        $unitMapping->conversion_to_base = $unitMapping->conversion_to_base ?? null;
                        return $unitMapping;
                    });
            }

            return array_merge($data, $includesData);
        } catch (\Exception $e) {
            return parent::toArray($request);
        }
    }
}
