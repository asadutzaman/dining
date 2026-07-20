<?php

namespace App\Models\Dining;

use App\Models\BaseModel;
use App\Enums\StatusEnum;
use App\Traits\Model\Uuid;
use App\Traits\Model\Autofill;

class MealBooking extends BaseModel
{
    public static $uuIdPrefix = '';

    // Deliberately no SoftDeletes: the (member_id, meal_date, meal_type) unique
    // key is what makes booking a toggle. Cancelling flips booking_status.
    use Autofill, Uuid;

    public const STATUS_BOOKED    = 'BOOKED';
    public const STATUS_CANCELLED = 'CANCELLED';
    public const STATUS_CONSUMED  = 'CONSUMED';
    public const STATUS_MISSED    = 'MISSED';

    public const CHARGE_PENDING = 'PENDING';
    public const CHARGE_CHARGED = 'CHARGED';
    public const CHARGE_WAIVED  = 'WAIVED';

    protected $fillable = [
        'member_id',
        'meal_date',
        'meal_type',
        'unit_price',
        'cutoff_at',
        'booking_status',
        'charge_status',
        'charged_amount',
        'source',
        'booked_at',
        'cancelled_at',
        'settled_at',
        'meal_token_id',
        'status',
    ];

    protected $casts = [
        // Integer
        'id'             => 'integer',
        'member_id'      => 'integer',
        'meal_token_id'  => 'integer',
        'created_by'     => 'integer',
        'updated_by'     => 'integer',
        'status'         => 'integer',
        // Decimal
        'unit_price'     => 'decimal:2',
        'charged_amount' => 'decimal:2',
        //Date
        'meal_date'      => 'date:Y-m-d',
        //Date Time
        'cutoff_at'      => 'datetime:Y-m-d H:i:s',
        'booked_at'      => 'datetime:Y-m-d H:i:s',
        'cancelled_at'   => 'datetime:Y-m-d H:i:s',
        'settled_at'     => 'datetime:Y-m-d H:i:s',
        'created_at'     => 'datetime:Y-m-d H:i:s',
        'updated_at'     => 'datetime:Y-m-d H:i:s',
        // String
        'meal_type'      => 'string',
        'booking_status' => 'string',
        'charge_status'  => 'string',
        'source'         => 'string',
    ];

    protected $dates = [
        'meal_date', 'cutoff_at', 'booked_at', 'cancelled_at', 'settled_at', 'created_at', 'updated_at',
    ];

    protected $attributes = [
        'status'         => StatusEnum::ACTIVE,
        'booking_status' => self::STATUS_BOOKED,
        'charge_status'  => self::CHARGE_PENDING,
        'source'         => 'APP',
    ];

    public function member()
    {
        return $this->hasOne(Member::class, 'id', 'member_id');
    }

    public function mealToken()
    {
        return $this->hasOne(MealToken::class, 'id', 'meal_token_id');
    }

    /**
     * Past the cutoff the booking is frozen: it can no longer be made or unmade.
     * A null cutoff means the meal accepts bookings right up to service.
     */
    public function isLocked(): bool
    {
        return $this->cutoff_at !== null && now()->greaterThan($this->cutoff_at);
    }

    /**
     * Only a live booking that has not yet been served can be cancelled, and only
     * before its cutoff -- after that the kitchen count is already committed.
     */
    public function isCancellable(): bool
    {
        return $this->booking_status === self::STATUS_BOOKED && !$this->isLocked();
    }
}
