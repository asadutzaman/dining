<?php

namespace App\Models;

use App\Enums\StatusEnum;
use App\Traits\Model\Autofill;
use App\Traits\Model\Uuid;
use Illuminate\Database\Eloquent\SoftDeletes;

class WorkflowStepTask extends BaseModel
{
    public static $uuIdPrefix = ''; // C-

    use  SoftDeletes, Autofill, Uuid;

    protected $fillable = [
        'workflow_id',
        'workflow_step_id',
        'action_name',
        'action_code',
        'task_key',
        'task_type',
        'field_name',
        'field_value',
        'status'
    ];

    protected $hidden = [
        'deleted_at'
    ];

    protected $casts = [
        // Integer
        'id'              => 'integer',
        'created_by'      => 'integer',
        'updated_by'      => 'integer',
        'status'          => 'integer',
        'workflow_id'      => 'integer',
        'workflow_step_id' => 'integer',
        //Date Time
        'created_at'    => 'datetime:Y-m-d H:i:s',
        'updated_at'    => 'datetime:Y-m-d H:i:s',
        // String
        'action_name'   => 'string',
        'action_code'   => 'string',
        'task_key'      => 'string',
        'task_type'     => 'string',
        'field_name'     => 'string',
        'field_value'    => 'string',
    ];

    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at'
    ];

    protected $attributes = [
        'status' => StatusEnum::ACTIVE,
    ];
}
