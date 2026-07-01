<?php

namespace App\Models;

use App\Enums\StatusEnum;
use App\Traits\Model\Autofill;
use App\Traits\Model\Uuid;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class WorkflowTransition extends BaseModel
{
    public static $uuIdPrefix = ''; // C-

    use  SoftDeletes, Autofill, Uuid;

    protected $fillable = [
        'workflow_id',
        'workflow_step_id',
        'workflow_record_id',
        'workflow_action_name',
        'workflow_action_code',
        'workflow_action_alias_text',
        'workflow_action_button_color',
        'comment',
        'status'
    ];

    protected $hidden = [
        'deleted_at'
    ];

    protected $casts = [
        // Integer
        'id'                => 'integer',
        'created_by'        => 'integer',
        'updated_by'        => 'integer',
        'status'            => 'integer',
        'workflow_id'        => 'integer',
        'workflow_step_id'   => 'integer',
        'workflow_record_id' => 'integer',
        //Date Time
        'created_at'    => 'datetime:Y-m-d H:i:s',
        'updated_at'    => 'datetime:Y-m-d H:i:s',
        // String
        'workflow_action_name'         => 'string',
        'workflow_action_code'         => 'string',
        'workflow_action_alias_text'   => 'string',
        'workflow_action_button_color' => 'string',
        'comment'                     => 'string',
    ];

    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at'
    ];

    protected $attributes = [
        'status' => StatusEnum::ACTIVE,
    ];

    public function workflow(): HasOne
    {
        return $this->hasOne(Workflow::class, 'id', 'workflow_id')->select(['id', 'workflow_name', 'workflow_code', 'type']);
    }

    public function workflowStep(): HasOne
    {
        return $this->hasOne(WorkflowStep::class, 'id', 'workflow_step_id')->select(['id', 'step_key', 'step_name', 'step_code', 'step_type']);
    }
}
