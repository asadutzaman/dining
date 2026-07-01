<?php

namespace App\Models;

use App\Enums\StatusEnum;
use App\Traits\Model\Uuid;
use App\Traits\Model\Autofill;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Requisition extends BaseModel
{
    public static $uuIdPrefix = ''; // C-

    use  SoftDeletes, Autofill, Uuid;

    protected $fillable = [
        'requisition_number',
        'branch_id',
        'logistic_id',
        'subject',
        'description',
        'reconcile_status',
        'revised_status',
        'process_status'
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
        'branch_id'          => 'integer',
        'logistic_id'        => 'integer',
        'reconcile_status'   => 'integer',
        // Enum
        //Date
        'date'               => 'date:Y-m-d',
        //Date Time
        'created_at'         => 'datetime:Y-m-d H:i:s',
        'updated_at'         => 'datetime:Y-m-d H:i:s',
        // String
        'revised_status'     => 'string',
        'process_status'     => 'string',
        'requisition_number' => 'string',
        'subject'            => 'string',
        'description'        => 'string',
    ];

    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at'
    ];

    protected $attributes = [
        'status' => StatusEnum::ACTIVE,
    ];

    public function logistic(): HasOne
    {
        return $this->hasOne(Logistic::class, 'id', 'logistic_id')->select(['id', 'name', 'code']);
    }

    public function branch(): HasOne
    {
        return $this->hasOne(Branch::class, 'id', 'branch_id')->select(['id', 'name']);
    }

    public function createdBy(): HasOne
    {
        return $this->hasOne(User::class, 'id', 'created_by')->select(['id', 'name']);
    }

    public function branchInfo(): BelongsTo
    {
        return $this->belongsTo(Branch::class, 'branch_id', 'id')->select(['id', 'name']);
    }
}
