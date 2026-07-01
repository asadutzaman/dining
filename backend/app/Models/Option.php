<?php

namespace App\Models;

class Option extends BaseModel
{
    protected $guarded = [];

    protected $hidden = [
       //
    ];

    protected $casts = [
        // Integer
        'id'         => 'integer',
        'autoload'   => 'integer',
        //Date Time
        'created_at' => 'datetime:Y-m-d H:i:s',
        'updated_at' => 'datetime:Y-m-d H:i:s',
        // String
        'module'     => 'string',
        'key'        => 'string',
        'value'      => 'string',
        'comment'    => 'string',
    ];

    protected $dates = [
        'created_at', 'updated_at'
    ];

    protected $attributes = [
        //
    ];

}
