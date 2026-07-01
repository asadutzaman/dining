<?php

namespace App\Models;

use App\Enums\StatusEnum;
use App\Traits\Model\Autofill;
use App\Traits\Model\Uuid;
use Illuminate\Database\Eloquent\SoftDeletes;

class StockAdjustmentItem extends BaseModel
{
    public static $uuIdPrefix = ''; // C-

    use  SoftDeletes, Autofill, Uuid;

    protected $fillable = [
        'stock_adjustment_id',
        'item_id',
        'quantity',
        'shelve_id',
        'remarks',
    ];

    protected $hidden = [
        'deleted_at'
    ];

    protected $casts = [
        // Integer
        'id'                  => 'integer',
        'created_by'          => 'integer',
        'updated_by'          => 'integer',
        'status'              => 'integer',
        'stock_adjustment_id' => 'integer',
        'item_id'             => 'integer',
        'shelve_id'           => 'integer',
        // Decimal
        'quantity'        => 'decimal:2',
        //Date
        'date'          => 'date:Y-m-d',
        //Date Time
        'created_at'    => 'datetime:Y-m-d H:i:s',
        'updated_at'    => 'datetime:Y-m-d H:i:s',
        // String
        'remarks'         => 'string',
    ];

    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at'
    ];

    protected $attributes = [
        'status' => StatusEnum::ACTIVE,
    ];

    public function itemInfo()
    {
        return $this->hasOne(Item::class, 'id', 'item_id')->select(['id', 'name_en', 'name_bn', 'code']);
    }
}
