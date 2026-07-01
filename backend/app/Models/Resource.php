<?php

namespace App\Models;

use App\Constants\Common;
use App\Traits\Model\Autofill;

class Resource extends BaseModel
{
    use  Autofill; // COMMENT IT FOR RUN SEEDER

    public $cachePrefix = 'resource';

    protected $guarded = [];

    protected $hidden = [
        //
    ];

    protected $casts = [
        // Integer
        'id'                => 'integer',
        'parent_id'         => 'integer',
        'sort_order'        => 'integer',
        'status'            => 'integer',
        //Date Time
        'created_at'        => 'datetime:Y-m-d H:i:s',
        'updated_at'        => 'datetime:Y-m-d H:i:s',
        // String
        'permission_type'   => 'string',
        'name'              => 'string',
        'display_name'      => 'string',
        'resource_uri'      => 'string',
        'controller_name'   => 'string',
        'server_url_prefix' => 'string',
    ];

    protected $dates = [
        'created_at', 'updated_at'
    ];

    protected $attributes = [
        'status' => Common::STATUS_ACTIVE,
    ];
}
