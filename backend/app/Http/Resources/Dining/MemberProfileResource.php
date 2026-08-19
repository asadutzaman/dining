<?php

namespace App\Http\Resources\Dining;

use Illuminate\Http\Resources\Json\JsonResource;

/**
 * The member as the app knows them (screen 1f). Deliberately a plain
 * JsonResource rather than BaseResource: the mobile API has its own envelope
 * and must not leak the audit/relational fields the admin resources expose.
 */
class MemberProfileResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'          => $this->id,
            'member_code' => $this->member_code,
            'name'        => $this->name,
            'initials'    => $this->initials(),
            'member_type' => $this->member_type,
            'phone'       => $this->phone,
            'email'       => $this->email,
            'photo_id'    => $this->photo_id,

            'class_name' => $this->class_name,
            'section'    => $this->section,
            'roll_no'    => $this->roll_no,

            'department'  => $this->whenLoaded('department', fn () => $this->department?->name_en),
            'designation' => $this->whenLoaded('designation', fn () => $this->designation?->name_en),

            // Never the full card number -- the app only needs to confirm which
            // card is linked, and the counter reader is the only thing that
            // legitimately needs the whole value.
            'card' => [
                'linked'        => !empty($this->rfid_card_number),
                'masked_number' => $this->maskedCardNumber(),
            ],

            'due_balance' => (float) $this->due_balance,

            'preferences' => [
                'language'                => $this->language ?: 'en',
                'notify_booking_reminder' => (bool) $this->notify_booking_reminder,
                'notify_cutoff_warning'   => (bool) $this->notify_cutoff_warning,
                'notify_weekly_summary'   => (bool) $this->notify_weekly_summary,
            ],

            'last_login_at' => $this->last_login_at?->format('Y-m-d H:i:s'),
        ];
    }
}
