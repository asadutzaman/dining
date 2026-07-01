<?php

namespace App\Models;

use App\Constants\Common;
use App\Traits\Model\Audit;

class Permission extends BaseModel
{
    // use Audit; // COMMENT IT FOR RUN SEEDER

    protected $guarded = [];

    protected $hidden = [
        //
    ];

    protected $casts = [
        // Integer
        'id'           => 'integer',
        'scope_id'     => 'integer',
        'role_id'      => 'integer',
        'user_id'      => 'integer',
        'created_by'   => 'integer',
        'updated_by'   => 'integer',
        'status'       => 'integer',
        //Date Time
        'created_at'   => 'datetime:Y-m-d H:i:s',
        'updated_at'   => 'datetime:Y-m-d H:i:s',
        // String
        'field_access' => 'string',
    ];

    protected $dates = [
        'created_at', 'updated_at'
    ];

    protected $attributes = [
        'status' => Common::STATUS_ACTIVE,
    ];
}
