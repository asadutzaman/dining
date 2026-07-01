<?php

namespace App\Models;

use App\Enums\StatusEnum;
use App\Traits\Model\Uuid;
use App\Traits\Model\Autofill;
use Illuminate\Database\Eloquent\SoftDeletes;

class ApplicantProfile extends BaseModel
{
    use  SoftDeletes, Autofill, Uuid;

    public static $uuIdPrefix = ''; // C-

    public $cachePrefix = 'applicantProfile';

    protected $fillable = [
        'registration_type',
        'user_id',
        'name_en',
        'name_en',
        'name_bn',
        'photo',
        'email',
        'mobile_no',
        'nid',
        'skype',
        'dob',
        'gender',
        'fathers_name_bn',
        'fathers_name_en',
        'mothers_name_bn',
        'mothers_name_en',
        'home_district_id',
        'nationality',
        'present_house_road_no',
        'present_village',
        'present_post_office',
        'present_upazila_id',
        'present_district_id',
        'present_division_id',
        'is_present_permanent_address_same',
        'permanent_district_id',
        'permanent_division_id',
        'permanent_house_road_no',
        'permanent_post_office',
        'permanent_upazila_id',
        'permanent_village',
        'institute_organization_type',
        'organization_category',
        'business_service_sector',
        'governance_type',
        'institute_organization_id',
        'institute_organization_other',
        'origin',
        'country_of_origin',
        'institute_organization_address',
        'institute_organization_post_office',
        'institute_organization_division',
        'institute_organization_district',
        'institute_organization_upazila',
        'institute_organization_website',
        'institute_organization_email',
        'institute_organization_mobile',
        'institute_organization_phone',
        'onwership_type',
        'onwership_type_other',
        'onwership_type_name',
        'onwership_type_mobile',
        'onwership_type_email',
        'onwership_type_signature',
        'onwership_type_seal',
        'trade_license_number',
        'bin',
        'contact_persion_name_en',
        'contact_persion_name_bn',
        'contact_persion_designation_id',
        'contact_persion_nid',
        'contact_persion_mobile',
        'contact_persion_email',
        'contact_persion_image',
        'status',
    ];

    protected $hidden = [
        'deleted_at'
    ];

    protected $casts = [
        // Integer
        'id'                                => 'integer',
        'created_by'                        => 'integer',
        'updated_by'                        => 'integer',
        'status'                            => 'integer',
        //Date Time
        'created_at'                        => 'datetime:Y-m-d H:i:s',
        'updated_at'                        => 'datetime:Y-m-d H:i:s',
        // String
        'organization_id'                   => 'integer',
        'organogram_id'                     => 'integer',
        'user_id'                           => 'integer',
        'registration_type'                 => 'integer',
        'name_en'                           => 'string',
        'name_bn'                           => 'string',
        'photo'                             => 'string',
        'email'                             => 'string',
        'mobile_no'                         => 'string',
        'nid'                               => 'string',
        'skype'                             => 'string',
        'dob'                               => 'date:Y-m-d',
        'gender'                            => 'string',
        'fathers_name_bn'                   => 'string',
        'fathers_name_en'                   => 'string',
        'mothers_name_bn'                   => 'string',
        'mothers_name_en'                   => 'string',
        'home_district_id'                  => 'integer',
        'nationality'                       => 'string',
        'present_house_road_no'             => 'string',
        'present_village'                   => 'string',
        'present_post_office'               => 'string',
        'present_upazila_id'                => 'integer',
        'present_district_id'               => 'integer',
        'present_division_id'               => 'integer',
        'is_present_permanent_address_same' => 'string',
        'permanent_district_id'             => 'integer',
        'permanent_division_id'             => 'integer',
        'permanent_house_road_no'           => 'string',
        'permanent_post_office'             => 'string',
        'permanent_upazila_id'              => 'integer',
        'permanent_village'                 => 'string',
        'institute_organization_type'       => 'string',
        'institute_organization_id'         => 'integer',
    ];

    protected $dates = [
        'created_at', 'updated_at', 'deleted_at'
    ];

    protected $attributes = [
        'status' => StatusEnum::ACTIVE,
    ];

}
