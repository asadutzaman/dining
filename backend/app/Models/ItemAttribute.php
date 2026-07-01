<?php

namespace App\Models;

use App\Enums\StatusEnum;
use App\Traits\Model\Autofill;
use App\Traits\Model\Uuid;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class ItemAttribute extends BaseModel
{
    public static $uuIdPrefix = ''; // C-

    use  SoftDeletes, Autofill, Uuid;

    protected $fillable = [
        'item_id',
        'attribute_id',
        'attribute_value_id',
        'status'
    ];

    protected $hidden = [
        'deleted_at'
    ];

    protected $casts = [
        // Integer
        'id'                 => 'integer',
        'created_by'         => 'integer',
        'updated_by'         => 'integer',
        'status'             => 'integer',
        'item_id'            => 'integer',
        'attribute_id'       => 'integer',
        'attribute_value_id' => 'integer',
        //Date Time
        'created_at'    => 'datetime:Y-m-d H:i:s',
        'updated_at'    => 'datetime:Y-m-d H:i:s',
    ];

    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at'
    ];

    protected $attributes = [
        'status' => StatusEnum::ACTIVE,
    ];

    public function attribute(): HasOne
    {
        return $this->hasOne(Attribute::class, 'id', 'attribute_id')->select(['id', 'name']);
    }

    public function attributeValue(): HasOne
    {
        return $this->hasOne(AttributeValue::class, 'id', 'attribute_value_id')->select(['id', 'value']);
    }
}
