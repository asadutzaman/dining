<?php

namespace App\Models;

use App\Enums\StatusEnum;
use App\Traits\Model\Autofill;
use App\Traits\Model\Uuid;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Supplier extends BaseModel
{
    public static $uuIdPrefix = ''; // C-

    use  SoftDeletes, Autofill, Uuid;

    protected $fillable = [
        'supplier_no',
        'supplier_name',
        'phone',
        'email',
        'address',
        'status',
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
        //Date Time
        'created_at'    => 'datetime:Y-m-d H:i:s',
        'updated_at'    => 'datetime:Y-m-d H:i:s',

        'supplier_no'   => 'string',
        'supplier_name' => 'string',
        'phone'         => 'string',
        'email'         => 'string',
        'address'       => 'string',
    ];

    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at'
    ];

    protected $attributes = [
        'status' => StatusEnum::ACTIVE,
    ];

    public function setSupplierNameAttribute($supplier_name)
    {
        $this->attributes['supplier_name'] = Str::squish($supplier_name);
    }
}
