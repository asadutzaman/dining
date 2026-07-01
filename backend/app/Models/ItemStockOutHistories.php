<?php

namespace App\Models;

use App\Enums\StatusEnum;
use App\Traits\Model\Autofill;
use App\Traits\Model\Uuid;
use Illuminate\Database\Eloquent\SoftDeletes;

class ItemStockOutHistories extends BaseModel
{
    public static $uuIdPrefix = ''; // C-

    use  SoftDeletes, Autofill, Uuid;

    protected $fillable = [
        'branch_id',
        'item_stock_id',
        'item_id',
        'quantity',
        'recordable_id',
        'recordable_type',
        'action_from',
        'remarks',
    ];

    protected $hidden = [
        'deleted_at'
    ];

    protected $casts = [
        // Integer
        'id'              => 'integer',
        'created_by'      => 'integer',
        'updated_by'      => 'integer',
        'status'          => 'integer',
        'branch_id'       => 'integer',
        'item_stock_id'   => 'integer',
        'item_id'         => 'integer',
        'recordable_id'   => 'integer',
        // Decimal
        'quantity'        => 'decimal:2',
        //Date Time
        'created_at'      => 'datetime:Y-m-d H:i:s',
        'updated_at'      => 'datetime:Y-m-d H:i:s',
        // String
        'recordable_type' => 'string',
        'action_from'     => 'string',
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
