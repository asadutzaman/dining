<?php

namespace App\Http\Resources\Dining;

use App\Http\Resources\BaseResource;

class MealTokenResource extends BaseResource
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
                'id'                 => $this->id,
                'token_number'       => $this->token_number,
                'member_id'          => $this->member_id,
                'meal_type'          => $this->meal_type,
                'meal_date'          => $this->meal_date,
                'amount'             => $this->amount,
                'payment_status'     => $this->payment_status,
                'payment_method'     => $this->payment_method,
                'collection_status'  => $this->collection_status,
                'collected_at'       => $this->collected_at,
                'status'             => $this->status,
                'created_by_name'    => $baseData['created_by_name'],
                'updated_by_name'    => $baseData['updated_by_name'],
                'created_at'         => $baseData['created_at'],
            ];

            if ($this->member) {
                $includesData['member_code'] = $this->member->member_code;
                $includesData['member_name'] = $this->member->name;
                $includesData['member_type'] = $this->member->member_type;
            }
            if ($this->issuedByUser) {
                $includesData['issued_by_name'] = $this->issuedByUser->name;
            }
            if ($this->collectedByUser) {
                $includesData['collected_by_name'] = $this->collectedByUser->name;
            }

            return array_merge($data, $includesData);
        } catch (\Exception $e) {
            return parent::toArray($request);
        }
    }

}
