<?php

namespace App\Http\Resources;

class PatientResource extends BaseResource
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
                'mrn'             => $this->mrn,
                'title'           => $this->title,
                'first_name'      => $this->first_name,
                'middle_name'     => $this->middle_name,
                'last_name'       => $this->last_name,
                'full_name'       => $this->full_name,
                'date_of_birth'   => $this->date_of_birth,
                'gender'          => $this->gender,
                'blood_group'     => $this->blood_group,
                'marital_status'  => $this->marital_status,
                'religion'        => $this->religion,
                'nationality'     => $this->nationality,
                'occupation'      => $this->occupation,
                'email'           => $this->email,
                'primary_phone'   => $this->primary_phone,
                'secondary_phone' => $this->secondary_phone,
                'emergency_contact_name' => $this->emergency_contact_name,
                'emergency_contact_phone' => $this->emergency_contact_phone,
                'emergency_contact_relation' => $this->emergency_contact_relation,
                'current_address' => $this->current_address,
                'current_city' => $this->current_city,
                'current_state' => $this->current_state,
                'current_country' => $this->current_country,
                'current_pincode' => $this->current_pincode,
                'permanent_address' => $this->permanent_address,
                'permanent_city' => $this->permanent_city,
                'permanent_state' => $this->permanent_state,
                'permanent_country' => $this->permanent_country,
                'permanent_pincode' => $this->permanent_pincode,
                'pan_number' => $this->pan_number,
                'voter_id' => $this->voter_id,
                'driving_license' => $this->driving_license,
                'passport_number' => $this->passport_number,
                'known_allergies' => $this->known_allergies,
                'chronic_diseases' => $this->chronic_diseases,
                'current_medications' => $this->current_medications,
                'surgical_history' => $this->surgical_history,
                'family_medical_history' => $this->family_medical_history,
                'social_history' => $this->social_history,
                'insurance_provider' => $this->insurance_provider,
                'insurance_policy_number' => $this->insurance_policy_number,
                'insurance_valid_from' => $this->insurance_valid_from,
                'insurance_valid_to' => $this->insurance_valid_to,
                'insurance_group_number' => $this->insurance_group_number,
                'insurance_phone' => $this->insurance_phone,
                'status' => $this->status,
                'is_sensitive' => $this->is_sensitive,
                'is_vip' => $this->is_vip,
                'consent_signed' => $this->consent_signed,
                'consent_signed_at' => $this->consent_signed_at,
                'special_notes' => $this->special_notes,
                'registration_date' => $this->registration_date,
                'last_visit_date' => $this->last_visit_date,
                'total_visits' => $this->total_visits,
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
