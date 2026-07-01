<?php

namespace App\Models;

use App\Traits\Model\Audit;

class ApplicationSetting extends BaseModel
{
    use Audit;

    protected $guarded = [];

    protected $table = 'application_settings';

    protected $casts = [
        // Integer
        'id'          => 'integer',
        'created_by'  => 'integer',
        'updated_by'  => 'integer',
        //Date Time
        'created_at'  => 'datetime:Y-m-d H:i:s',
        'updated_at'  => 'datetime:Y-m-d H:i:s',
        // String
        'type'         => 'string',
        'label'        => 'string',
        'option'       => 'string',
        'value'        => 'string',
        'is_changable' => 'integer',
    ];

    protected $dates = [
        'created_at', 'updated_at'
    ];
}
