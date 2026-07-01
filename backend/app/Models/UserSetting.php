<?php

namespace App\Models;

use App\Traits\Model\Autofill;

class UserSetting extends BaseModel
{
    use  Autofill;

    protected $guarded = [];

    protected $hidden = [
        'created_at',
        'updated_at'
    ];

    protected $casts = [
        // Integer
        'id'         => 'integer',
        'user_id'    => 'integer',
        //Date Time
        'created_at' => 'datetime:Y-m-d H:i:s',
        'updated_at' => 'datetime:Y-m-d H:i:s',
        // String
        'key'        => 'string',
        'value'      => 'string',
    ];

    protected $dates = [
        'created_at',
        'updated_at'
    ];

    protected $attributes = [
        //
    ];
}
