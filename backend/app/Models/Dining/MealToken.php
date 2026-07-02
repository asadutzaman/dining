<?php

namespace App\Models\Dining;

use App\Models\BaseModel;
use App\Models\User;
use App\Enums\StatusEnum;
use App\Traits\Model\Uuid;
use App\Traits\Model\Autofill;
use Illuminate\Database\Eloquent\SoftDeletes;

class MealToken extends BaseModel
{
    public static $uuIdPrefix = ''; // C-

    use  SoftDeletes, Autofill, Uuid;

    protected $fillable = [
        'token_number',
        'member_id',
        'meal_type',
        'meal_date',
        'amount',
        'payment_status',
        'payment_method',
        'collection_status',
        'collected_at',
        'collected_by',
        'issued_by',
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
        'issued_by'    => 'integer',
        'created_by'   => 'integer',
        'updated_by'   => 'integer',
        'status'       => 'integer',
        // Decimal
        'amount'       => 'decimal:2',
        //Date
        'meal_date'    => 'date:Y-m-d',
        //Date Time
        'collected_at' => 'datetime:Y-m-d H:i:s',
        'created_at'   => 'datetime:Y-m-d H:i:s',
        'updated_at'   => 'datetime:Y-m-d H:i:s',
        // String
        'token_number'      => 'string',
        'meal_type'         => 'string',
        'payment_status'    => 'string',
        'payment_method'    => 'string',
        'collection_status' => 'string',
    ];

    protected $dates = [
        'meal_date', 'collected_at', 'created_at', 'updated_at', 'deleted_at'
    ];

    protected $attributes = [
        'status'            => StatusEnum::ACTIVE,
        'collection_status' => 'ISSUED',
    ];

    public function member()
    {
        return $this->hasOne(Member::class, 'id', 'member_id');
    }

    public function issuedByUser()
    {
        return $this->hasOne(User::class, 'id', 'issued_by');
    }

    public function collectedByUser()
    {
        return $this->hasOne(User::class, 'id', 'collected_by');
    }
}
