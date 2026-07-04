<?php

namespace App\Models\Dining;

use App\Models\BaseModel;
use App\Enums\StatusEnum;
use App\Traits\Model\Uuid;
use App\Traits\Model\Autofill;
use Illuminate\Database\Eloquent\SoftDeletes;

class MealSetting extends BaseModel
{
    public static $uuIdPrefix = ''; // C-

    use  SoftDeletes, Autofill, Uuid;

    protected $fillable = [
        'meal_type',
        'cost',
        'start_time',
        'end_time',
        'effective_from',
        'status',
    ];

    protected $hidden = [
        'deleted_at'
    ];

    protected $casts = [
        // Integer
        'id'         => 'integer',
        'created_by' => 'integer',
        'updated_by' => 'integer',
        'status'     => 'integer',
        // Decimal
        'cost'       => 'decimal:2',
        //Date
        'effective_from' => 'date:Y-m-d',
        //Date Time
        'created_at' => 'datetime:Y-m-d H:i:s',
        'updated_at' => 'datetime:Y-m-d H:i:s',
        // String
        'meal_type'  => 'string',
        'start_time' => 'string',
        'end_time'   => 'string',
    ];

    protected $dates = [
        'effective_from', 'created_at', 'updated_at', 'deleted_at'
    ];

    protected $attributes = [
        'status' => StatusEnum::ACTIVE,
    ];
}
