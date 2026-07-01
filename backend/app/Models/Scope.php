<?php

namespace App\Models;

use App\Casts\JsonArray;
use App\Constants\Common;
use App\Traits\Model\Autofill;

class Scope extends BaseModel
{
    use Autofill; // COMMENT IT FOR RUN SEEDER

    public $cachePrefix = 'scope';

    protected $guarded = [];

    protected $hidden = [
        //
    ];

    protected $casts = [
        // Integer
        'id'                  => 'integer',
        'resource_id'         => 'integer',
        'created_by'          => 'integer',
        'updated_by'          => 'integer',
        'sort_order'          => 'integer',
        'status'              => 'integer',
        //Date Time
        'created_at'          => 'datetime:Y-m-d H:i:s',
        'updated_at'          => 'datetime:Y-m-d H:i:s',
        // Json
        'actions'             => JsonArray::class,
        // String
        'scope'               => 'string',
        'display_name'        => 'string',
        'http_method'         => 'string',
        'action_name'         => 'string',
        'uri'                 => 'string',
    ];

    protected $dates = [
        'created_at', 'updated_at'
    ];

    protected $attributes = [
        'status' => Common::STATUS_ACTIVE,
    ];
}
