<?php

namespace App\Models;

use App\Enums\ItemTypeEnum;
use App\Enums\StatusEnum;
use App\Traits\Model\Autofill;
use App\Traits\Model\Uuid;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Item extends BaseModel
{
    public static $uuIdPrefix = ''; // C-

    use  SoftDeletes, Autofill, Uuid;

    protected $fillable = [
        'type',
        'logistic_id',
        'item_category_id',
        'brand_id',
        'base_unit_id',
        'code',
        'name_en',
        'name_bn',
        // 'name_code',
        'description',
        'reorder_qty',
        'status'
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
        'logistic_id'      => 'integer',
        'item_category_id' => 'integer',
        'brand_id'         => 'integer',
        'base_unit_id'     => 'integer',
        // Decimal
        'reorder_qty'      => 'decimal:2',
        // String
        // 'type'             => ItemTypeEnum::class,
        'code'             => 'string',
        'name_en'          => 'string',
        'name_bn'          => 'string',
        // 'name_code'      => 'string',
        'description'      => 'string',
        //Date Time
        'created_at'       => 'datetime:Y-m-d H:i:s',
        'updated_at'       => 'datetime:Y-m-d H:i:s',
    ];

    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at'
    ];

    protected $attributes = [
        'status' => StatusEnum::ACTIVE,
    ];

    public function setNameEnAttribute($name_en)
    {
        $this->attributes['name_en'] = Str::squish($name_en);
        // $this->attributes['name_code'] = Str::lower(Str::squish($name_en));
    }

    public function logistic(): HasOne
    {
        return $this->hasOne(Logistic::class, 'id', 'logistic_id')->select(['id', 'name', 'code']);
    }

    public function logisticInfo(): BelongsTo
    {
        return $this->belongsTo(Logistic::class, 'logistic_id')->select(['id', 'name', 'code']);
    }

    public function itemCategory(): HasOne
    {
        return $this->hasOne(ItemCategory::class, 'id', 'item_category_id')->select(['id', 'name', 'code']);
    }

    public function brand(): HasOne
    {
        return $this->hasOne(Brand::class, 'id', 'brand_id')->select(['id', 'name']);
    }

    public function baseUnit(): HasOne
    {
        return $this->hasOne(Unit::class, 'id', 'base_unit_id')->select(['id', 'name', 'short_name']);
    }

    public function branchInfo(): BelongsTo
    {
        return $this->belongsTo(Branch::class, 'branch_id')->select(['id', 'name']);
    }
}
