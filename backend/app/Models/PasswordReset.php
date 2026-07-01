<?php

namespace App\Models;

use Carbon\Carbon;
use App\Traits\Model\Autofill;

class PasswordReset extends BaseModel
{
    use Autofill;

    public $incrementing = false;

    public $timestamps = false;

    protected $guarded = [];

    protected $hidden = [
        'token'
    ];

    protected $casts = [
        //Date Time
        'created_at' => 'datetime:Y-m-d H:i:s',
        // String
        'email'      => 'string',
        'token'      => 'string',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model)
        {
            $model->created_at = Carbon::now()->toDateTimeString();
        });
    }

}
