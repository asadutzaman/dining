<?php

namespace App\Models;

use App\Constants\Common;
use App\Traits\Model\Autofill;

class OauthAuthClient extends BaseModel
{
    use Autofill;

    protected $guarded = [];

    protected $hidden = [
        'created_at', 'updated_at'
    ];

    protected $casts = [
        // Integer
        'id'              => 'integer',
        'user_id'         => 'integer',
        'password_client' => 'integer',
        'revoked'         => 'integer',
        'is_default'      => 'integer',
        //Date Time
        'created_at'      => 'datetime:Y-m-d H:i:s',
        'updated_at'      => 'datetime:Y-m-d H:i:s',
        // String
        'name'            => 'string',
        'client_id'       => 'string',
        'client_secret'   => 'string',
        'redirect_uri'    => 'string',
    ];

    protected $dates = [
        'created_at', 'updated_at'
    ];

    protected $attributes = [
        'user_id'    => 1,
        'revoked'    => Common::NO,
    ];

}
