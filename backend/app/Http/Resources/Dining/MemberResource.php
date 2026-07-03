<?php

namespace App\Http\Resources\Dining;

use App\Http\Resources\BaseResource;

class MemberResource extends BaseResource
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
                'id'                => $this->id,
                'member_code'       => $this->member_code,
                'rfid_card_number'  => $this->rfid_card_number,
                'member_type'       => $this->member_type,
                'name'              => $this->name,
                'phone'             => $this->phone,
                'email'             => $this->email,
                'photo_id'          => $this->photo_id,
                'department_id'     => $this->department_id,
                'designation_id'    => $this->designation_id,
                'class_name'        => $this->class_name,
                'section'           => $this->section,
                'roll_no'           => $this->roll_no,
                'due_balance'       => $this->due_balance,
                'status'            => $this->status,
                'created_by_name'   => $baseData['created_by_name'],
                'updated_by_name'   => $baseData['updated_by_name'],
            ];

            if ($this->department) {
                $includesData['department_name'] = $this->department->name;
            }
            if ($this->designation) {
                $includesData['designation_name'] = $this->designation->name;
            }

            return array_merge($data, $includesData);
        } catch (\Exception $e) {
            return parent::toArray($request);
        }
    }

}
