<?php

namespace App\Models;

use App\Casts\Json;
use App\Enums\StatusEnum;
use App\Traits\Model\Autofill;
use App\Traits\Model\Uuid;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class StockTransfer extends BaseModel
{
    public static $uuIdPrefix = ''; // C-

    use  SoftDeletes, Autofill, Uuid;

    protected $fillable = [
        'stock_transfer_number',
        'transfer_from',
        'transfer_to',
        'reason',
        'process_status',
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
        'transfer_from' => 'integer',
        'transfer_to'   => Json::class,
        // Decimal
        'amount'        => 'decimal:4',
        //Date
        'date'          => 'date:Y-m-d',
        //Date Time
        'created_at'    => 'datetime:Y-m-d H:i:s',
        'updated_at'    => 'datetime:Y-m-d H:i:s',
        // String
        'reason'                => 'string',
        'stock_transfer_number' => 'string',
        'process_status'        => 'string',
    ];

    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at'
    ];

    protected $attributes = [
        'status' => StatusEnum::ACTIVE,
    ];

    public function transferFromBranch(): HasOne
    {
        return $this->hasOne(Branch::class, 'id', 'transfer_from')->select(['id', 'name']);
    }

    public function transferToBranch(): HasOne
    {
        return $this->hasOne(Branch::class, 'id', 'transfer_to')->select(['id', 'name']);
    }
}
