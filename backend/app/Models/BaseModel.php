<?php

namespace App\Models;

use App\Traits\Model\AuditLogTrait;
use App\Traits\Model\CacheFlushTrait;
use Illuminate\Database\Eloquent\Model;
use DateTimeInterface;

class BaseModel extends Model
{
    use  AuditLogTrait, CacheFlushTrait;

    public $enableCache  = true;

    public $cachePrefix = '';

    public $cacheControllerMethodList = ['index', 'show', 'dropdown'];

    const DATA_TIME_FORMAT = 'Y-m-d H:i:s';

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format(self::DATA_TIME_FORMAT);
    }
}
