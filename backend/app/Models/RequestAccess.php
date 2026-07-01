<?php

namespace App\Models;

use App\Constants\Common;
use App\Traits\Model\Autofill;
use App\Traits\Model\Uuid;
use Illuminate\Database\Eloquent\SoftDeletes;

class RequestAccess extends BaseModel
{
    use  SoftDeletes, Autofill, Uuid;

    protected $guarded = [];

    protected $hidden = [
        'deleted_at'
    ];

    protected $casts = [
        // Integer
        'id'           => 'integer',
        'created_by'   => 'integer',
        'updated_by'   => 'integer',
        'status'       => 'integer',
        //Date Time
        'created_at'   => 'datetime:Y-m-d H:i:s',
        'updated_at'   => 'datetime:Y-m-d H:i:s',
        // String
        'first_name'   => 'string',
        'last_name'    => 'string',
        'company_name' => 'string',
        'email'        => 'string',
        'phone'        => 'string',
        'profile_type' => 'string',
        'device_name'  => 'string',
        'device_id'    => 'string',
        'identifier'   => 'string',
        'type'         => 'string',
        'os'           => 'string',
        'version'      => 'string',
        'token'        => 'string',
        'firebase_device_token' => 'string',
    ];

    protected $dates = [
        'created_at', 'updated_at', 'deleted_at'
    ];

    protected $attributes = [
        'status' => Common::STATUS_ACTIVE,
    ];

}
