<?php

namespace App\Http\Resources\Dining;

use App\Http\Resources\BaseResource;

class MealSettingResource extends BaseResource
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
                'meal_type'       => $this->meal_type,
                'cost'            => $this->cost,
                'start_time'      => $this->start_time,
                'end_time'        => $this->end_time,
                'effective_from'  => $this->effective_from,
                'status'          => $this->status,
                'created_by_name' => $baseData['created_by_name'],
                'updated_by_name' => $baseData['updated_by_name'],
            ];
            return array_merge($data, $includesData);
        } catch (\Exception $e) {
            return parent::toArray($request);
        }
    }

}
