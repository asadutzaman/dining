<?php

namespace App\Models;

use App\Casts\Json;
use App\Constants\Common;
use App\Traits\Model\Uuid;
use App\Traits\Model\Autofill;
use Illuminate\Database\Eloquent\SoftDeletes;

class Group extends BaseModel
{
    use SoftDeletes, Uuid;
    use Autofill; // COMMENT IT FOR RUN SEEDER

    public $cachePrefix = 'group';

    protected $fillable = [
        'role_ids',
        'code',
        'name',
        'description',
        'icon'
    ];

    protected $hidden = [
        'deleted_at'
    ];

    protected $casts = [
        // Integer
        'id'              => 'integer',
        'used_as_default' => 'integer',
        'created_by'      => 'integer',
        'updated_by'      => 'integer',
        'status'          => 'integer',
        //Date Time
        'created_at'      => 'datetime:Y-m-d H:i:s',
        'updated_at'      => 'datetime:Y-m-d H:i:s',
        // Json
        'role_ids'        =>  Json::class,
        // String
        'code'            => 'string',
        'name'            => 'string',
        'description'     => 'string',
        'icon'            => 'string',
    ];

    protected $dates = [
        'created_at', 'updated_at', 'deleted_at'
    ];

    protected $attributes = [
        'status' => Common::STATUS_ACTIVE,
    ];
}
