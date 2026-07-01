<?php

namespace App\Models;

use App\Enums\StatusEnum;
use App\Traits\Model\Uuid;
use App\Traits\Model\Autofill;
use Illuminate\Database\Eloquent\SoftDeletes;

class RequisitionItemLimit extends BaseModel
{
    public static $uuIdPrefix = ''; // C-

    use  SoftDeletes, Autofill, Uuid;

    protected $fillable = [
        'designation_id',
        'item_id',
        'limit_type',
        'max_qty',
        'effective_from',
        'status'
    ];

    protected $hidden = [
        'deleted_at'
    ];

    protected $casts = [
        // Integer
        'id'            => 'integer',
        'created_by'    => 'integer',
        'updated_by'    => 'integer',
        'designation_id' => 'integer',
        'item_id'       => 'integer',
        'status'        => 'integer',
        // Decimal
        'max_qty'       => 'decimal:2',
        //Date
        'effective_from' => 'date:Y-m-d',
        //Date Time
        'created_at'    => 'datetime:Y-m-d H:i:s',
        'updated_at'    => 'datetime:Y-m-d H:i:s',
        // String
        'limit_type'    => 'string',
    ];

    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at'
    ];

    protected $attributes = [
        'status' => StatusEnum::ACTIVE,
    ];

    public function designation()
    {
        return $this->hasOne(Designation::class, 'id', 'designation_id')->select(['id', 'title']);
    }

    public function item()
    {
        return $this->hasOne(Item::class, 'id', 'item_id')->select(['id', 'name_en', 'code']);
    }
}
