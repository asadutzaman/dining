<?php

namespace App\Models\Dining;

use App\Models\BaseModel;
use App\Enums\StatusEnum;
use App\Traits\Model\Uuid;

class MemberDevice extends BaseModel
{
    public static $uuIdPrefix = '';

    use Uuid;

    protected $fillable = [
        'member_id',
        'push_token',
        'platform',
        'app_version',
        'device_model',
        'last_seen_at',
        'status',
    ];

    protected $casts = [
        'id'           => 'integer',
        'member_id'    => 'integer',
        'status'       => 'integer',
        'last_seen_at' => 'datetime:Y-m-d H:i:s',
        'created_at'   => 'datetime:Y-m-d H:i:s',
        'updated_at'   => 'datetime:Y-m-d H:i:s',
        'push_token'   => 'string',
        'platform'     => 'string',
        'app_version'  => 'string',
        'device_model' => 'string',
    ];

    protected $dates = [
        'last_seen_at', 'created_at', 'updated_at',
    ];

    protected $attributes = [
        'status'   => StatusEnum::ACTIVE,
        'platform' => 'ANDROID',
    ];

    public function member()
    {
        return $this->hasOne(Member::class, 'id', 'member_id');
    }
}
