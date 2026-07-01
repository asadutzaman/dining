<?php

namespace App\Models;

use App\Enums\StatusEnum;
use App\Traits\Model\Autofill;
use App\Traits\Model\Uuid;
use Illuminate\Database\Eloquent\SoftDeletes;

class WorkflowStepApprover extends BaseModel
{
    public static $uuIdPrefix = ''; // C-

    use  SoftDeletes, Autofill, Uuid;

    protected $fillable = [
        'workflow_id',
        'workflow_step_id',
        'approver_group_id',
        'approver_group_member_id',
        'user_id',
        'approver_type',
        'approver_mode',
        'designation_id',
        'sort_order',
        'status'
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
        // Decimal
        'amount'        => 'decimal:4',
        //Date
        'date'          => 'date:Y-m-d',
        //Date Time
        'created_at'    => 'datetime:Y-m-d H:i:s',
        'updated_at'    => 'datetime:Y-m-d H:i:s',
        // String
        'title'         => 'string',
    ];

    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at'
    ];

    protected $attributes = [
        'status' => StatusEnum::ACTIVE,
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id')->select(['id', 'first_name', 'last_name']);
    }
    public function approverGroup()
    {
        return $this->belongsTo(ApproverGroup::class, 'approver_group_id', 'id')->select(['id', 'name']);
    }
    public function designation()
    {
        return $this->belongsTo(Designation::class, 'designation_id', 'id')->select(['id', 'title']);
    }
}
