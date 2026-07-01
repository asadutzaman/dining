<?php

namespace App\Models;

use App\Enums\StatusEnum;
use App\Traits\Model\Uuid;
use App\Traits\Model\Autofill;
use Illuminate\Database\Eloquent\SoftDeletes;

class Payment extends BaseModel
{
    public static $uuIdPrefix = ''; // C-

    use  SoftDeletes, Autofill, Uuid;

    protected $fillable = [
        'payment_number',
        'member_id',
        'amount',
        'payment_date',
        'payment_method',
        'remarks',
        'collected_by',
        'status',
    ];

    protected $hidden = [
        'deleted_at'
    ];

    protected $casts = [
        // Integer
        'id'           => 'integer',
        'member_id'    => 'integer',
        'collected_by' => 'integer',
        'created_by'   => 'integer',
        'updated_by'   => 'integer',
        'status'       => 'integer',
        // Decimal
        'amount'       => 'decimal:2',
        //Date
        'payment_date' => 'date:Y-m-d',
        //Date Time
        'created_at'   => 'datetime:Y-m-d H:i:s',
        'updated_at'   => 'datetime:Y-m-d H:i:s',
        // String
        'payment_number' => 'string',
        'payment_method' => 'string',
        'remarks'        => 'string',
    ];

    protected $dates = [
        'payment_date', 'created_at', 'updated_at', 'deleted_at'
    ];

    protected $attributes = [
        'status'         => StatusEnum::ACTIVE,
        'payment_method' => 'CASH',
    ];

    public function member()
    {
        return $this->hasOne(Member::class, 'id', 'member_id');
    }

    public function collectedByUser()
    {
        return $this->hasOne(User::class, 'id', 'collected_by');
    }
}
