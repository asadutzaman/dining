<?php

namespace App\Traits\Model;

use Illuminate\Cache\TaggableStore;
use Illuminate\Support\Facades\Cache;

trait CacheFlushTrait
{
    public static function bootCacheFlushTrait() {
        static::created(function ($model) {
            if(!empty($model->cachePrefix) && $model->enableCache) {
                self::cacheDeleteByKey("{$model->cachePrefix}.dropdown");
                self::flushTagCache($model->cachePrefix);
                self::flushCache($model->cachePrefix);
            }
        });

        static::saving(function ($model) {
            if(!empty($model->cachePrefix) && $model->enableCache) {
                $cacheKey = self::getCacheKeyByRecordId($model->id, $model->cachePrefix);
                self::cacheDeleteByKey($cacheKey);
                self::cacheDeleteByKey("{$model->cachePrefix}.dropdown");
                self::flushTagCache($model->cachePrefix);
                self::flushCache($model->cachePrefix);
            }
        });

        static::deleted(function ($model) {
            if(!empty($model->cachePrefix) && $model->enableCache) {
                $cacheKey = self::getCacheKeyByRecordId($model->id, $model->cachePrefix);
                self::cacheDeleteByKey($cacheKey);
                self::cacheDeleteByKey("{$model->cachePrefix}.dropdown");
                self::flushTagCache($model->cachePrefix);
                self::flushCache($model->cachePrefix);
            }
        });
    }

    public static function getCacheKeyByRecordId($recordId, $cachePrefix)
    {
        return $cachePrefix . '.id.' . $recordId;
    }

    public static function cacheDeleteByKey($cacheKey)
    {
        if( Cache::has( $cacheKey ) ) {
            Cache::forget($cacheKey);
        }
    }

    public static function flushTagCache($cachePrefix)
    {
        if (Cache::getStore() instanceof TaggableStore) {
            Cache::tags([$cachePrefix])->flush();
        }
    }

    public static function flushCache($cachePrefix)
    {
        // $cacheKey = "{$cachePrefix}.permission";
        // Cache::forget($cacheKey);
    }
}