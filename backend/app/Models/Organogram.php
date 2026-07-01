<?php

namespace App\Models;

use App\Enums\StatusEnum;
use App\Traits\Model\Autofill;
use App\Traits\Model\Uuid;
use Illuminate\Database\Eloquent\SoftDeletes;

class Organogram extends BaseModel
{
    use  SoftDeletes, Autofill, Uuid;

    public static $uuIdPrefix = ''; // C-

    public $cachePrefix = 'organogram';

    protected $guarded = [];

    protected $hidden = [
        'deleted_at'
    ];

    protected $casts = [
        // Integer
        'id'                     => 'integer',
        'parent_id'              => 'integer',
        'organization_id'        => 'integer',
        'organogram_category_id' => 'integer',
        'division_id'            => 'integer',
        'district_id'            => 'integer',
        'thana_id'               => 'integer',
        'created_by'             => 'integer',
        'updated_by'             => 'integer',
        'status'                 => 'integer',
        'sort_order'             => 'integer',
        //Date Time
        'created_at'             => 'datetime:Y-m-d H:i:s',
        'updated_at'             => 'datetime:Y-m-d H:i:s',
        // String
        'name_en'                => 'string',
        'name_bn'                => 'string',
        'code'                   => 'string',
        'office_type'            => 'string',
        'address'                => 'string',
        'phone'                  => 'string',
        'fax'                    => 'string',
    ];

    protected $dates = [
        'created_at', 'updated_at', 'deleted_at'
    ];

    protected $attributes = [
        'status' => StatusEnum::ACTIVE,
    ];

}
