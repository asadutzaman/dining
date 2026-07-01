<?php

namespace App\Models;

use App\Constants\Common;
use App\Traits\Model\Autofill;

class OauthRefreshToken extends BaseModel
{
    use Autofill;

    protected $guarded = [];

    protected $hidden = [
        //
    ];

    protected $casts = [
        // Integer
        'id'              => 'integer',
        'user_id'         => 'integer',
        'access_token_id' => 'integer',
        'revoked'         => 'integer',
        //Date Time
        'created_at'      => 'datetime:Y-m-d H:i:s',
        'updated_at'      => 'datetime:Y-m-d H:i:s',
        'expires_at'      => 'datetime:Y-m-d H:i:s',
        // String
        'refresh_token'   => 'string',
    ];

    protected $dates = [
        'created_at',
        'updated_at',
        'expires_at'
    ];

    protected $attributes = [
        'user_id' => 1,
        'revoked' => Common::NO,
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            // $model->expires_at = date('Y-m-d H:i:s', strtotime('+30 minutes'));
            $model->expires_at = date('Y-m-d', strtotime('+1 years'));
        });
    }
}
