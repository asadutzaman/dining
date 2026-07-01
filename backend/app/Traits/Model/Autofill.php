<?php

namespace App\Traits\Model;

use App\Services\SessionService;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Arr;

trait Autofill
{
    protected static function bootAutofill()
    {
        static::creating(function ($model) {
            $sessionService = (new SessionService())->init();
            $userData = $sessionService->getUserData();
            $createdBy = !empty(Arr::get($userData, 'id', Arr::get($model, 'created_by', null))) ? Arr::get($userData, 'id', Arr::get($model, 'created_by', null)) : 1;
            $updatedBy = !empty(Arr::get($userData, 'id', Arr::get($model, 'updated_by', null))) ? Arr::get($userData, 'id', Arr::get($model, 'updated_by', null)) : 1;
            // $userId = !empty(Arr::get($userData, 'id', Arr::get($model, 'user_id', null))) ? Arr::get($userData, 'id', Arr::get($model, 'user_id', null)) : 1;
            $organogramId = $sessionService->getOrganogramId();
            $organogramId = !empty(Arr::get($model, 'organogram_id', $organogramId)) ? Arr::get($model, 'organogram_id', $organogramId) : 1;

            // if (Schema::hasColumn($model->getTable(), 'user_id')) {
            //     $model->user_id = $userId;
            // }
            if (Schema::hasColumn($model->getTable(), 'created_by')) {
                $model->created_by = !empty($createdBy) ? $createdBy : null;
            }
            if (Schema::hasColumn($model->getTable(), 'updated_by')) {
                $model->updated_by = !empty($updatedBy) ? $updatedBy : null;
            }
            if (Schema::hasColumn($model->getTable(), 'organogram_id')) {
                $model->organogram_id =  $organogramId;
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
