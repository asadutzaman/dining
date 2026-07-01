<?php

namespace App\Models;

use App\Enums\StatusEnum;
use App\Traits\Model\Uuid;
use App\Traits\Model\Autofill;

class Enum extends BaseModel
{
    use  Autofill, Uuid;

    public static $uuIdPrefix = ''; // C-

    public $cachePrefix = 'enum';

    protected $guarded = [];

    protected $hidden = [
        'deleted_at'
    ];

    protected $casts = [
        // Integer
        'id'          => 'integer',
        'created_by'  => 'integer',
        'updated_by'  => 'integer',
        'is_default'  => 'integer',
        'sort_order'  => 'integer',
        'status'      => 'integer',
        //Date Time
        'created_at'  => 'datetime:Y-m-d H:i:s',
        'updated_at'  => 'datetime:Y-m-d H:i:s',
        // String
        'type'        => 'string',
        'key'         => 'string',
        'value'       => 'string',
    ];

    protected $dates = [
        'created_at', 'updated_at', 'deleted_at'
    ];

    protected $attributes = [
        'status' => StatusEnum::ACTIVE,
    ];
}
