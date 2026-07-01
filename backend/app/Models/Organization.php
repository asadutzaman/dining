<?php

namespace App\Models;

use App\Casts\IntegerOrNullCast;
use App\Casts\Json;
use App\Constants\Common;
use App\Traits\Model\Audit;
use App\Traits\Model\Uuid;
use Illuminate\Database\Eloquent\SoftDeletes;

class Organization extends BaseModel
{
    use  SoftDeletes, Audit, Uuid;

    public $cachePrefix = 'organization';

    protected $guarded = [];

    protected $hidden = [
        'deleted_at'
    ];

    protected $casts = [
        // Integer
        'id'             => 'integer',
        'created_by'     => 'integer',
        'updated_by'     => 'integer',
        'status'         => 'integer',
        //Date Time
        'created_at'     => 'datetime:Y-m-d H: i: s',
        'updated_at'     => 'datetime:Y-m-d H: i: s',
        // String
        'name_en'        => 'string',
        'name_bn'        => 'string',
        'short_name'     => 'string',
        'description'    => 'string',
        'mobile'         => 'string',
        'telephone'      => 'string',
        'email'          => 'string',
        'sort_order'     => 'integer',
        'logo_image'     => 'string',
    ];

    protected $dates = [
        'created_at', 'updated_at', 'deleted_at'
    ];

    protected $attributes = [
        'status' => Common::STATUS_ACTIVE,
    ];
}
