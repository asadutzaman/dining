<?php

namespace App\Models;

use App\Constants\Common;
use App\Traits\Model\Autofill;

class AppsModule extends BaseModel
{
    use  Autofill;

    protected $guarded = [];

    protected $hidden = [
        //
    ];

    protected $casts = [
        // Integer
        'id'          => 'integer',
        'apps_id'     => 'integer',
        'created_by'  => 'integer',
        'updated_by'  => 'integer',
        'sort_order'  => 'integer',
        'status'      => 'integer',
        //Date Time
        'created_at'  => 'datetime:Y-m-d H:i:s',
        'updated_at'  => 'datetime:Y-m-d H:i:s',
        // String
        'code'        => 'string',
        'name'        => 'string',
        'description' => 'string',
    ];

    protected $dates = [
        'created_at', 'updated_at'
    ];

    protected $attributes = [
        'status' => Common::STATUS_ACTIVE,
    ];

}
