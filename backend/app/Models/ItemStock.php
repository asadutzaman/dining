<?php

namespace App\Models;

use App\Enums\StatusEnum;
use App\Traits\Model\Autofill;
use App\Traits\Model\Uuid;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;


class ItemStock extends BaseModel
{
    public static $uuIdPrefix = ''; // C-

    use  SoftDeletes, Autofill, Uuid;

    protected $fillable = [
        'branch_id',
        'item_id',
        'shelve_id',
        'unit_price',
        'quantity',
        'balance_quantity',
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
        'id'            => 'integer',
        'created_by'    => 'integer',
        'updated_by'    => 'integer',
        'status'        => 'integer',
        'branch_id'     => 'integer',
        'item_id'       => 'integer',
        'shelve_id' => 'integer',
        'recordable_id' => 'integer',
        // Decimal
        'amount'        => 'decimal:2',
        // Float
        'unit_price'    => 'decimal:2',
        'quantity'      => 'decimal:2',
        'balance_quantity' => 'decimal:2',

        //Date
        'date'          => 'date:Y-m-d',
        //Date Time
        'created_at'    => 'datetime:Y-m-d H:i:s',
        'updated_at'    => 'datetime:Y-m-d H:i:s',
        // String
        'title'         => 'string',
        'recordable_type' => 'string',
        'action_from'       => 'string',
        'remarks' => 'string',
    ];

    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at'
    ];

    protected $attributes = [
        'status' => StatusEnum::ACTIVE,
    ];

    public function branchInfo(): BelongsTo
    {
        return $this->belongsTo(Branch::class, 'branch_id')->select('id', 'name');
    }

    public function itemInfo(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'item_id')->select('id', 'type', 'name_en', 'name_bn', 'code', 'logistic_id', 'reorder_qty');
    }

    public function shelveInfo(): BelongsTo
    {
        return $this->belongsTo(Shelve::class, 'shelve_id')->select('id', 'name');
    }
}
