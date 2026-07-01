<?php

namespace App\Models;

use App\Enums\StatusEnum;
use App\Traits\Model\Autofill;
use App\Traits\Model\Uuid;
use Illuminate\Database\Eloquent\SoftDeletes;

class Patient extends BaseModel
{
    public static $uuIdPrefix = ''; // C-

    use  SoftDeletes, Autofill, Uuid;

    protected $fillable = [
        'mrn',
        'title',
        'first_name',
        'middle_name',
        'last_name',
        'full_name',
        'date_of_birth',
        'gender',
        'blood_group',
        'marital_status',
        'religion',
        'nationality',
        'occupation',
        'email',
        'primary_phone',
        'secondary_phone',
        'emergency_contact_name',
        'emergency_contact_phone',
        'emergency_contact_relation',
        'current_address',
        'current_city',
        'current_state',
        'current_country',
        'current_pincode',
        'permanent_address',
        'permanent_city',
        'permanent_state',
        'permanent_country',
        'permanent_pincode',
        'pan_number',
        'voter_id',
        'driving_license',
        'passport_number',
        'known_allergies',
        'chronic_diseases',
        'current_medications',
        'surgical_history',
        'family_medical_history',
        'social_history',
        'insurance_provider',
        'insurance_policy_number',
        'insurance_valid_from',
        'insurance_valid_to',
        'insurance_group_number',
        'insurance_phone',
        'is_sensitive',
        'is_vip',
        'consent_signed',
        'consent_signed_at',
        'special_notes',
        'registration_date',
        'last_visit_date',
        'total_visits',
        'created_by',
        'updated_by',
        'status'
    ];

    protected $hidden = [
        'deleted_at'
    ];

    protected $casts = [
        // Integer
        'id'            => 'integer',
        'created_by'    => 'integer',
        'updated_by'    => 'integer',
        'status'        => 'integer',
        // String
        'mrn'           => 'string',
        // Decimal
        'amount'        => 'decimal:4',
        //Date
        'date'          => 'date:Y-m-d',
        //Date Time
        'created_at'    => 'datetime:Y-m-d H:i:s',
        'updated_at'    => 'datetime:Y-m-d H:i:s',
        // String
        'title'         => 'string',
    ];

    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at'
    ];

    protected $attributes = [
        'status' => StatusEnum::ACTIVE,
    ];
}
