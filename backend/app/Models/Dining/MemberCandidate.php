<?php

namespace App\Models\Dining;

use App\Models\BaseModel;
use App\Traits\Model\Uuid;
use App\Traits\Model\Autofill;
use Illuminate\Database\Eloquent\SoftDeletes;

class MemberCandidate extends BaseModel
{
    public static $uuIdPrefix = ''; // C-

    use  SoftDeletes, Autofill, Uuid;

    protected $fillable = [
        'name',
        'type',
        'staff_id',
        'roll_no',
    ];

    protected $hidden = [
        'deleted_at'
    ];

    protected $casts = [
        // Integer
        'id'              => 'integer',
        'created_by'      => 'integer',
        'updated_by'      => 'integer',
        //Date Time
        'created_at'      => 'datetime:Y-m-d H:i:s',
        'updated_at'      => 'datetime:Y-m-d H:i:s',
        // String
        'name'            => 'string',
        'type'            => 'string',
        'staff_id'        => 'string',
        'roll_no'         => 'string',
    ];

    protected $dates = [
        'created_at', 'updated_at', 'deleted_at'
    ];

    public function importedMember()
    {
        return $this->hasOne(Member::class, 'candidate_id', 'id');
    }
}
