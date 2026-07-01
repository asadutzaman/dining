<?php

namespace App\Models;

use App\Enums\StatusEnum;
use App\Traits\Model\Autofill;
use App\Traits\Model\Uuid;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GoodsReceiveNote extends BaseModel
{
    public static $uuIdPrefix = ''; // C-

    use  SoftDeletes, Autofill, Uuid;

    protected $fillable = [
        'grn_number',
        'branch_id',
        'supplier_id',
        'logistic_id',
        'ref_po_number',
        'ref_po_date',
        'ref_challan_no',
        'ref_challan_date',
        'received_date',
        'remarks',
        'process_status',
        'status',
    ];

    protected $hidden = [
        'deleted_at'
    ];

    protected $casts = [
        // Integer
        'id'               => 'integer',
        'created_by'       => 'integer',
        'updated_by'       => 'integer',
        'status'           => 'integer',
        'branch_id'        => 'integer',
        'logistic_id'      => 'integer',
        'supplier_id'      => 'integer',
        'sort_order'       => 'integer',
        'status'           => 'integer',

        // Decimal
        'amount'           => 'decimal:2',
        //Date
        'date'             => 'date:Y-m-d',
        //Date Time
        'created_at'       => 'datetime:Y-m-d H:i:s',
        'updated_at'       => 'datetime:Y-m-d H:i:s',
        'ref_challan_date' => 'date:Y-m-d',
        'received_date'    => 'date:Y-m-d',
        'ref_po_date'      => 'date:Y-m-d',
        // String
        'title'            => 'string',
        'grn_number'       => 'string',
        'ref_po_number'    => 'string',
        'ref_challan_no'   => 'string',
        'process_status'   => 'string',
    ];

    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at'
    ];

    protected $attributes = [
        'status' => StatusEnum::ACTIVE,
    ];

    public function logistic(): HasOne
    {
        return $this->hasOne(Logistic::class, 'id', 'logistic_id')->select(['id', 'name', 'code']);
    }

    public function branch(): HasOne
    {
        return $this->hasOne(Branch::class, 'id', 'branch_id')->select(['id', 'name']);
    }

    public function goodsReceiveNoteItems(): HasMany
    {
        return $this->hasMany(GoodsReceiveNoteItem::class, 'goods_receive_note_id', 'id');
    }
}
