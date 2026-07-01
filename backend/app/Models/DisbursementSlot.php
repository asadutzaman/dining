<?php

namespace App\Models;

use App\Enums\StatusEnum;
use App\Traits\Model\Uuid;
use App\Traits\Model\Autofill;
use Illuminate\Database\Eloquent\SoftDeletes;

class DisbursementSlot extends BaseModel
{
    public static $uuIdPrefix = ''; // C-

    use  SoftDeletes, Autofill, Uuid;

    protected $fillable = [
        'date',
        'start_time',
        'end_time',
        'assign_capacity',
        'remaining_assign_capacity',
        'slot_duration',
    ];

    protected $hidden = [
        'deleted_at'
    ];

    protected $casts = [
        // Integer
        'id'            => 'integer',
        'created_by'    => 'integer',
        'updated_by'    => 'integer',
        // Integer
        'assign_capacity'          => 'integer',
        'remaining_assign_capacity' => 'integer',
        'slot_duration'                 => 'integer',
        // Decimal
        //Date
        'date'          => 'date:Y-m-d',
        'start_time'    => 'datetime:H:i',
        'end_time'      => 'datetime:H:i',
        'created_at'    => 'datetime:Y-m-d H:i:s',
        'updated_at'    => 'datetime:Y-m-d H:i:s',
        // String

    ];

    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at'
    ];

    protected $attributes = [
        'status' => StatusEnum::ACTIVE,
    ];
}
