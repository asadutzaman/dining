<?php

namespace App\Models;

use App\Enums\StatusEnum;
use App\Traits\Model\Autofill;
use App\Traits\Model\Uuid;
use Illuminate\Database\Eloquent\SoftDeletes;

class WorkflowTransitionAssignment extends BaseModel
{
    public static $uuIdPrefix = ''; // C-

    use  SoftDeletes, Autofill, Uuid;

    protected $fillable = [
        'workflow_id',
        'workflow_step_id',
        'workflow_record_id',
        'workflow_record_from',
        'workflow_transition_id',
        'assigned_to',
        'assigned_by',
        'status'
    ];

    protected $hidden = [
        'deleted_at'
    ];

    protected $casts = [
        // Integer
        'id'                    => 'integer',
        'created_by'            => 'integer',
        'updated_by'            => 'integer',
        'status'                => 'integer',
        'workflow_id'            => 'integer',
        'workflow_step_id'       => 'integer',
        'workflow_record_id'     => 'integer',
        'workflow_transition_id' => 'integer',
        'assigned_to'           => 'integer',
        'assigned_by'           => 'integer',
        //Date Time
        'created_at'            => 'datetime:Y-m-d H:i:s',
        'updated_at'            => 'datetime:Y-m-d H:i:s',
        'workflow_record_from'   => 'string',
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
