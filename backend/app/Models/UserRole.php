<?php

namespace App\Models;

use App\Traits\Model\Autofill;

class UserRole extends BaseModel
{
    use Autofill;

    protected $guarded = [];

    protected $hidden = [
        //
    ];

    protected $casts = [
        // Integer
        'id'         => 'integer',
        'user_id'    => 'integer',
        'role_id'    => 'integer',
        //Date Time
        'created_at' => 'datetime:Y-m-d H:i:s',
        'updated_at' => 'datetime:Y-m-d H:i:s',
    ];

    protected $dates = [
        'created_at', 'updated_at'
    ];

}
