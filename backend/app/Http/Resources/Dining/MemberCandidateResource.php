<?php

namespace App\Http\Resources\Dining;

use App\Http\Resources\BaseResource;

class MemberCandidateResource extends BaseResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        return [
            'id'          => $this->id,
            'name'        => $this->name,
            'type'        => $this->type,
            'member_type' => strtoupper($this->type),
            'external_id' => $this->external_id,
            'staff_id'    => $this->staff_id,
            'roll_no'     => $this->roll_no,
            'rfid'        => $this->rfid,
            'image_url'   => $this->image_url,
            'has_card'    => !empty($this->rfid),
        ];
    }
}
