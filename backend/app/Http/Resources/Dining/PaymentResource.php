<?php

namespace App\Http\Resources\Dining;

use App\Http\Resources\BaseResource;

class PaymentResource extends BaseResource
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
                'payment_number'  => $this->payment_number,
                'member_id'       => $this->member_id,
                'amount'          => $this->amount,
                'payment_date'    => $this->payment_date,
                'payment_method'  => $this->payment_method,
                'remarks'         => $this->remarks,
                'status'          => $this->status,
                'created_by_name' => $baseData['created_by_name'],
                'updated_by_name' => $baseData['updated_by_name'],
                'created_at'      => $baseData['created_at'],
            ];

            if ($this->member) {
                $includesData['member_code'] = $this->member->member_code;
                $includesData['member_name'] = $this->member->name;
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
