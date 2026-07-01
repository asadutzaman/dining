<?php

namespace App\Traits\Model;

use Illuminate\Support\Facades\Schema;
use Ramsey\Uuid\Uuid as Generator;

trait Uuid
{
    protected static function bootUuid()
    {
        static::creating(function ($model) {
            if (Schema::hasColumn($model->getTable(), 'uuid')) {
                $model->uuid = Generator::uuid4()->toString();
            }
        });
    }
}
