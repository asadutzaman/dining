<?php

namespace App\Models\Dining;

use App\Models\BaseModel;
use App\Traits\Model\Uuid;

class MemberOtp extends BaseModel
{
    public static $uuIdPrefix = '';

    use Uuid;

    protected $fillable = [
        'phone',
        'member_id',
        'otp_hash',
        'expires_at',
        'consumed_at',
        'attempt_count',
        'request_ip',
    ];

    // The hash never leaves the server, under any serialization.
    protected $hidden = [
        'otp_hash',
    ];

    protected $casts = [
        'id'            => 'integer',
        'member_id'     => 'integer',
        'attempt_count' => 'integer',
        'expires_at'    => 'datetime:Y-m-d H:i:s',
        'consumed_at'   => 'datetime:Y-m-d H:i:s',
        'created_at'    => 'datetime:Y-m-d H:i:s',
        'updated_at'    => 'datetime:Y-m-d H:i:s',
        'phone'         => 'string',
        'request_ip'    => 'string',
    ];

    protected $dates = [
        'expires_at', 'consumed_at', 'created_at', 'updated_at',
    ];

    public function member()
    {
        return $this->hasOne(Member::class, 'id', 'member_id');
    }

    public function isExpired(): bool
    {
        return now()->greaterThan($this->expires_at);
    }

    public function isConsumed(): bool
    {
        return $this->consumed_at !== null;
    }
}
