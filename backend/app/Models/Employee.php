<?php

namespace App\Models;

use App\Enums\StatusEnum;
use App\Traits\Model\Autofill;
use App\Traits\Model\Uuid;
use Illuminate\Database\Eloquent\SoftDeletes;

class Employee extends BaseModel
{
    use  SoftDeletes, Autofill, Uuid;

    public static $uuIdPrefix = ''; // C-

    public $cachePrefix = 'employee';

    protected $fillable = [
        'organization_id',
        'organogram_id',
        'user_id',
        'employee_id',
        'name_en',
        'name_bn',
        'father_name',
        'mother_name',
        'gender',
        'mobile',
        'religion',
        'employee_type',
        'designation_id',
        'employee_category',
        'employee_class',
        'dob',
        'joining_date',
        'image',
        'e_signature',
        'status'
    ];

    protected $hidden = [
        'deleted_at'
    ];

    protected $casts = [
        // Integer
        'id'                => 'integer',
        'created_by'        => 'integer',
        'updated_by'        => 'integer',
        'status'            => 'integer',
        'designation_id'    => 'integer',
        'user_id'           => 'integer',
        //Date
        'dob'               => 'date:Y-m-d',
        'joining_date'      => 'date:Y-m-d',
        //Date Time
        'created_at'        => 'datetime:Y-m-d H:i:s',
        'updated_at'        => 'datetime:Y-m-d H:i:s',
        // String
        'employee_id'       => 'string',
        'employee_class'    => 'string',
        'employee_category' => 'string',
        'name_en'           => 'string',
        'name_bn'           => 'string',
        'father_name'       => 'string',
        'mother_name'       => 'string',
        'employee_type'     => 'string',
        'gender'            => 'string',
        'image'             => 'string',
        'e_signature'       => 'string',
    ];

    protected $dates = [
        'dob', 'joining_date', 'created_at', 'updated_at', 'deleted_at'
    ];

    protected $attributes = [
        'status' => StatusEnum::ACTIVE,
    ];

}
