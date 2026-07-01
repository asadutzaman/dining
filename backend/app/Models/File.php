<?php

namespace App\Models;

use App\Constants\Common;
use App\Traits\Model\Autofill;
use Illuminate\Database\Eloquent\SoftDeletes;

class File extends BaseModel
{
    use  SoftDeletes, Autofill;

    public $cachePrefix = 'file';

    protected $primaryKey = 'file_id';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $guarded = [];

    protected $hidden = [
        'deleted_at', 'password'
    ];

    protected $casts = [
        // Integer
        'folder_id'         => 'integer',
        'downloads'         => 'integer',
        'views'             => 'integer',
        'is_public'         => 'integer',
        'owner_id'          => 'integer',
        'sort_order'        => 'integer',
        // Double
        'size'              => 'double',
        //Date Time
        'created_at'        => 'datetime:Y-m-d H:i:s',
        'updated_at'        => 'datetime:Y-m-d H:i:s',
        // String
        'filename'          => 'string',
        'original_filename' => 'string',
        'file_type'         => 'string',
        'mime_type'         => 'string',
        'file_path'         => 'string',
        'file_url'          => 'string',
        'ext'               => 'string',
        'width'             => 'string',
        'height'            => 'string',
        'meta'              => 'string',
        'last_name'         => 'string',
    ];

    protected $dates = [
        'created_at', 'updated_at', 'deleted_at'
    ];

    protected $attributes = [
        'is_public' => Common::STATUS_ACTIVE,
    ];
}
