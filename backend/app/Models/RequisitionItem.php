<?php

namespace App\Models;

use App\Enums\StatusEnum;
use App\Traits\Model\Autofill;
use App\Traits\Model\Uuid;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class RequisitionItem extends BaseModel
{
    public static $uuIdPrefix = ''; // C-

    use  SoftDeletes, Autofill, Uuid;

    protected $fillable = [
        'requisition_id',
        'item_id',
        'request_quantity',
        'revised_quantity',
        'due_quantity',
        'remarks'
    ];

    protected $hidden = [
        'deleted_at'
    ];

    protected $casts = [
        // Integer
        'id'            => 'integer',
        'created_by'    => 'integer',
        'updated_by'    => 'integer',
        'status'        => 'integer',
        'requisition_id'    => 'integer',
        'item_id'        => 'integer',

        // Decimal
        'amount'        => 'decimal:2',
        // Float
        'request_quantity'   => 'decimal:2',
        'revised_quantity'   => 'decimal:2',
        'due_quantity'       => 'decimal:2',
        //Date
        'date'          => 'date:Y-m-d',
        //Date Time
        'created_at'    => 'datetime:Y-m-d H:i:s',
        'updated_at'    => 'datetime:Y-m-d H:i:s',
        // String
        'title'         => 'string',
        'remarks'       => 'string'
    ];

    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at'
    ];

    protected $attributes = [
        'status' => StatusEnum::ACTIVE,
    ];

    public function itemInfo(): HasOne
    {
        return $this->hasOne(Item::class, 'id', 'item_id')->select(['id', 'name_en', 'code']);
    }

    // FOR ITEM REQUISITION STATUS REPORT
    public function requisition()
    {
        return $this->belongsTo(Requisition::class, 'requisition_id');
    }
}
