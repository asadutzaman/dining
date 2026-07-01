<?php

namespace App\Traits\Model;

use App\Services\SessionService;
use Illuminate\Support\Facades\Schema;
use App\Services\JwtService;
use Illuminate\Support\Arr;

trait Audit
{
    protected static function bootAudit()
    {
        static::creating(function ($model) {
            $sessionService = (new SessionService())->init();
            $userData = $sessionService->getUserData();
            $createdBy = Arr::get($userData, 'id', Arr::get($model, 'created_by', 1));
            $updatedBy = Arr::get($userData, 'id', Arr::get($model, 'updated_by', 1));

            if (Schema::hasColumn($model->getTable(), 'created_by')) {
                $model->created_by = !empty($createdBy) ? $createdBy : 1;
            }
            if (Schema::hasColumn($model->getTable(), 'updated_by')) {
                $model->updated_by = !empty($updatedBy) ? $updatedBy : 1;
            }
        });

        static::updating(function ($model) {
            $sessionService = (new SessionService())->init();
            $userData = $sessionService->getUserData();

            if (Schema::hasColumn($model->getTable(), 'updated_by')) {
                $model->updated_by = Arr::get($userData, 'id', Arr::get($model, 'updated_by', null));
            }
        });

        static::deleting(function ($model) {
            $sessionService = (new SessionService())->init();
            $userData = $sessionService->getUserData();

            if (Schema::hasColumn($model->getTable(), 'deleted_by')) {
                $model->deleted_by = Arr::get($userData, 'id', Arr::get($model, 'deleted_by', null));
                $model->save();
            }
        });
    }
}
