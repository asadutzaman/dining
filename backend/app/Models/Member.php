<?php

namespace App\Models;

use App\Enums\StatusEnum;
use App\Traits\Model\Uuid;
use App\Traits\Model\Autofill;
use Illuminate\Database\Eloquent\SoftDeletes;

class Member extends BaseModel
{
    public static $uuIdPrefix = ''; // C-

    use  SoftDeletes, Autofill, Uuid;

    protected $fillable = [
        'member_code',
        'rfid_card_number',
        'member_type',
        'name',
        'phone',
        'email',
        'department_id',
        'designation_id',
        'class_name',
        'section',
        'roll_no',
        'due_balance',
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
        'created_by'      => 'integer',
        'updated_by'      => 'integer',
        'status'          => 'integer',
        // Decimal
        'due_balance'     => 'decimal:2',
        //Date Time
        'created_at'      => 'datetime:Y-m-d H:i:s',
        'updated_at'      => 'datetime:Y-m-d H:i:s',
        // String
        'member_code'      => 'string',
        'rfid_card_number' => 'string',
        'member_type'      => 'string',
        'name'             => 'string',
        'phone'            => 'string',
        'email'            => 'string',
        'class_name'       => 'string',
        'section'          => 'string',
        'roll_no'          => 'string',
    ];

    protected $dates = [
        'created_at', 'updated_at', 'deleted_at'
    ];

    protected $attributes = [
        'status'      => StatusEnum::ACTIVE,
        'due_balance' => 0,
    ];

    public function department()
    {
        return $this->hasOne(Department::class, 'id', 'department_id');
    }

    public function designation()
    {
        return $this->hasOne(Designation::class, 'id', 'designation_id');
    }
}
