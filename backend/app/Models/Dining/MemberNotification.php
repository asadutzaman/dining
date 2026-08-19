<?php

namespace App\Models\Dining;

use App\Models\BaseModel;
use App\Traits\Model\Uuid;

class MemberNotification extends BaseModel
{
    public static $uuIdPrefix = '';

    use Uuid;

    public const TYPE_CUTOFF_WARNING    = 'CUTOFF_WARNING';
    public const TYPE_BOOKING_CONFIRMED = 'BOOKING_CONFIRMED';
    public const TYPE_BOOKING_CANCELLED = 'BOOKING_CANCELLED';
    public const TYPE_BOOKING_REMINDER  = 'BOOKING_REMINDER';
    public const TYPE_WEEKLY_PLAN_SAVED = 'WEEKLY_PLAN_SAVED';
    public const TYPE_WEEKLY_SUMMARY    = 'WEEKLY_SUMMARY';

    protected $fillable = [
        'member_id',
        'type',
        'title',
        'body',
        'action_route',
        'data',
        'read_at',
        'dismissed_at',
    ];

    protected $casts = [
        'id'           => 'integer',
        'member_id'    => 'integer',
        'data'         => 'array',
        'read_at'      => 'datetime:Y-m-d H:i:s',
        'dismissed_at' => 'datetime:Y-m-d H:i:s',
        'created_at'   => 'datetime:Y-m-d H:i:s',
        'updated_at'   => 'datetime:Y-m-d H:i:s',
        'type'         => 'string',
        'title'        => 'string',
        'body'         => 'string',
        'action_route' => 'string',
    ];

    protected $dates = [
        'read_at', 'dismissed_at', 'created_at', 'updated_at',
    ];

    public function member()
    {
        return $this->hasOne(Member::class, 'id', 'member_id');
    }
}
