<?php

namespace App\Http\Resources;

use App\Repositories\AttributeValueRepository;

class AttributeResource extends BaseResource
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
                'name'            => $this->name,
                'description'     => $this->description,
                'code'            => $this->code,
                'status'          => $this->status,
                'created_by_name' => $baseData['created_by_name'],
                'updated_by_name' => $baseData['updated_by_name'],
                'created_at'      => $baseData['created_at'],
                'updated_at'      => $baseData['updated_at'],
            ];
            if (!$this->isCollection) {
                $data['attributeValueListData'] = (new AttributeValueRepository())
                    ->newQuery()
                    ->where('attribute_id', $this->id)
                    ->get();

                foreach ($data['attributeValueListData'] as $key => $attributeValue) {
                    $attributeValue->value = $attributeValue->value ?? null;
                }
            }
            return array_merge($data, $includesData);
        } catch (\Exception $e) {
            return parent::toArray($request);
        }
    }
}
