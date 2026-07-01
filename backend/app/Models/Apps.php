<?php

namespace App\Models;

use App\Constants\Common;
use App\Traits\Model\Audit;
use App\Traits\Model\Uuid;
use Illuminate\Database\Eloquent\SoftDeletes;

class Apps extends BaseModel
{
    use  SoftDeletes, Audit, Uuid;

    protected $guarded = [];

    protected $hidden = [
        'deleted_at'
    ];

    protected $casts = [
        // Integer
        'id'          => 'integer',
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
        'url'         => 'string',
        'icon'        => 'string',
        'version'     => 'string',
    ];

    protected $dates = [
        'created_at', 'updated_at', 'deleted_at'
    ];

    protected $attributes = [
        'status' => Common::STATUS_ACTIVE,
    ];

}
