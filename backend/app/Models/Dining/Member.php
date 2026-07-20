<?php

namespace App\Models\Dining;

use App\Models\BaseModel;
use App\Models\Department;
use App\Models\Designation;
use App\Enums\StatusEnum;
use App\Traits\Model\Uuid;
use App\Traits\Model\Autofill;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Auth\Authenticatable as AuthenticatableTrait;
use Illuminate\Contracts\Auth\Authenticatable as AuthenticatableContract;
use Laravel\Sanctum\HasApiTokens;

/**
 * Members authenticate from the mobile app with phone + OTP, holding a Sanctum
 * token. They are a separate identity from staff `User` accounts, which keep
 * using the existing custom access_token guard.
 */
class Member extends BaseModel implements AuthenticatableContract
{
    public static $uuIdPrefix = ''; // C-

    use  SoftDeletes, Autofill, Uuid, AuthenticatableTrait, HasApiTokens;

    protected $fillable = [
        'member_code',
        'rfid_card_number',
        'member_type',
        'name',
        'phone',
        'email',
        'photo_id',
        'department_id',
        'designation_id',
        'staff_id',
        'candidate_id',
        'class_name',
        'section',
        'roll_no',
        'due_balance',
        'language',
        'notify_booking_reminder',
        'notify_cutoff_warning',
        'notify_weekly_summary',
        'last_login_at',
        'status',
    ];

    protected $hidden = [
        'deleted_at'
    ];

    protected $casts = [
        // Integer
        'id'              => 'integer',
        'department_id'   => 'integer',
        'designation_id'  => 'integer',
        'candidate_id'    => 'integer',
        'created_by'      => 'integer',
        'updated_by'      => 'integer',
        'status'          => 'integer',
        // Decimal
        'due_balance'     => 'decimal:2',
        // Boolean
        'notify_booking_reminder' => 'boolean',
        'notify_cutoff_warning'   => 'boolean',
        'notify_weekly_summary'   => 'boolean',
        //Date Time
        'last_login_at'   => 'datetime:Y-m-d H:i:s',
        'created_at'      => 'datetime:Y-m-d H:i:s',
        'updated_at'      => 'datetime:Y-m-d H:i:s',
        // String
        'member_code'      => 'string',
        'rfid_card_number' => 'string',
        'member_type'      => 'string',
        'name'             => 'string',
        'phone'            => 'string',
        'email'            => 'string',
        'photo_id'         => 'string',
        'staff_id'         => 'string',
        'class_name'       => 'string',
        'section'          => 'string',
        'roll_no'          => 'string',
        'language'         => 'string',
    ];

    protected $dates = [
        'created_at', 'updated_at', 'deleted_at'
    ];

    protected $attributes = [
        'status'      => StatusEnum::ACTIVE,
        'due_balance' => 0,
        'language'    => 'en',
    ];

    public function department()
    {
        return $this->hasOne(Department::class, 'id', 'department_id');
    }

    public function designation()
    {
        return $this->hasOne(Designation::class, 'id', 'designation_id');
    }

    public function bookings()
    {
        return $this->hasMany(MealBooking::class, 'member_id', 'id');
    }

    public function devices()
    {
        return $this->hasMany(MemberDevice::class, 'member_id', 'id');
    }

    public function notifications()
    {
        return $this->hasMany(MemberNotification::class, 'member_id', 'id');
    }

    /**
     * Card numbers are shown masked in the app (screen 1f) -- the full number is
     * only ever needed at the counter reader.
     */
    public function maskedCardNumber(): ?string
    {
        if (empty($this->rfid_card_number)) {
            return null;
        }

        return str_repeat('•', 4) . ' ' . str_repeat('•', 4) . ' ' . substr($this->rfid_card_number, -4);
    }

    public function initials(): string
    {
        $parts = preg_split('/\s+/', trim((string) $this->name), -1, PREG_SPLIT_NO_EMPTY) ?: [];
        if (empty($parts)) {
            return '?';
        }

        $first = mb_substr($parts[0], 0, 1);
        $last  = count($parts) > 1 ? mb_substr(end($parts), 0, 1) : '';

        return mb_strtoupper($first . $last);
    }
}
