<?php

namespace App\Models;

use App\Constants\Common;
use App\Traits\Model\Audit;
use App\Traits\Model\Uuid;
use Illuminate\Database\Eloquent\SoftDeletes;

class Role extends BaseModel
{
    use  SoftDeletes, Uuid;
    use Audit; // COMMENT IT FOR RUN SEEDER

    public $cachePrefix = 'role';

    protected $fillable = [
        // 'parent_id',
        'code',
        'name',
        'description',
        'organogram_id',
        // 'used_as_default',
        'status',
        'created_by',
        'updated_by',
    ];

    protected $hidden = [
        'deleted_at'
    ];

    protected $casts = [
        // Integer
        'id'                 => 'integer',
        // 'parent_id'          => 'integer',
        // 'used_as_default'    => 'integer',
        'created_by'         => 'integer',
        'updated_by'         => 'integer',
        'status'             => 'integer',
        //Date Time
        'created_at'         => 'datetime:Y-m-d H:i:s',
        'updated_at'         => 'datetime:Y-m-d H:i:s',
        // String
        'code'               => 'string',
        'name'               => 'string',
        'description'        => 'string',
    ];

    protected $dates = [
        'created_at', 'updated_at', 'deleted_at'
    ];

    protected $attributes = [
        'status' => Common::STATUS_ACTIVE,
    ];
}
