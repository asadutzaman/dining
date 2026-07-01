<?php

namespace App\Services;

class CacheService
{
    public static function createCacheKey(string $prefix, array $params)
    {
        return $prefix. '.' .md5(serialize($params));
    }
}