<?php

namespace App\Models;

use App\Enums\StatusEnum;
use App\Traits\Model\Autofill;
use App\Traits\Model\Uuid;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class GoodsReceiveNoteItem extends BaseModel
{
    public static $uuIdPrefix = ''; // C-

    use  SoftDeletes, Autofill, Uuid;

    protected $fillable = [
        'goods_receive_note_id',
        'item_id',
        'unit_price',
        'quantity',
        'total_price',
        'shelve_id',
        'expire_date',
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
        'goods_receive_note_id' => 'integer',
        'item_id'       => 'integer',
        'shelve_id'     => 'integer',

        // Decimal
        'amount'        => 'decimal:2',
        // Float
        'total_price'   => 'decimal:2',
        'quantity'      => 'decimal:2',
        'unit_price'    => 'decimal:2',
        //Date
        'expire_date'   => 'date:Y-m-d',
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

    public function itemInfo(): HasOne
    {
        return $this->hasOne(Item::class, 'id', 'item_id')->select(['id', 'name_en', 'code']);
    }

    public function shelveInfo(): HasOne
    {
        return $this->hasOne(Shelve::class, 'id', 'shelve_id')->select(['id', 'name']);
    }
}
