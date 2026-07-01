<?php

namespace App\Models;

use App\Casts\Json;
use App\Traits\Model\Uuid;
use App\Traits\Model\Audit;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Eloquent\SoftDeletes;

class User extends BaseModel
{
    use  SoftDeletes, Uuid;
    use Audit; // COMMENT IT FOR RUN SEEDER

    public $cachePrefix = 'user';

    protected $guarded = [];

    protected $hidden = [
        'remember_token',
        'password',
    ];

    protected $casts = [
        // Integer
        'id'                    => 'integer',
        'organization_ids'      => Json::class,
        'organogram_ids'        => Json::class,
        'role_ids'              => Json::class,
        // 'manager_id'            => 'integer',
        'logistic_id'           => 'integer',
        'branch_id'             => 'integer',
        'department_id'         => 'integer',
        'force_password_change' => 'integer',
        'session_timeout'       => 'integer',
        'session_timeout_never' => 'integer',
        'device_id'             => 'integer',
        'web_access'            => 'integer',
        'app_access'            => 'integer',
        'is_verified'           => 'integer',
        'requests_count'        => 'integer',
        'created_by'            => 'integer',
        'updated_by'            => 'integer',
        'status'                => 'integer',
        //Date Time
        'email_verified_at'     => 'datetime:Y-m-d H:i:s',
        'phone_verified_at'     => 'datetime:Y-m-d H:i:s',
        // 'logged_in_at'          => 'datetime:Y-m-d H:i:s',
        'created_at'            => 'datetime:Y-m-d H:i:s',
        'updated_at'            => 'datetime:Y-m-d H:i:s',
        // String
        'first_name'            => 'string',
        'last_name'             => 'string',
        'company_name'          => 'string',
        'email'                 => 'string',
        'user_type'             => 'string',
        'phone'                 => 'string',
        'timezone'              => 'string',
        'locale'                => 'string',
        'profile_image'         => 'string',
        'remember_token'        => 'string',
        'employee_id'           => 'string',
        // 'logged_in_ip'          => 'string',
    ];

    protected $dates = [
        'email_verified_at',
        'phone_verified_at',
        'logged_in_at',
        'created_at',
        'updated_at',
        'deleted_at'
    ];

    protected $attributes = [
        'web_access' => 1,
        'app_access' => 1,
    ];

    public function setDeviceIdAttribute($value)
    {
        $this->attributes['device_id'] = $this->nullIfBlank($value);
    }

    public static function boot()
    {
        parent::boot();

        User::saving(function ($user) {
            if (isset($user->password) && $user->isDirty('password')) {
                $user->password = Hash::make($user->password);
            }
        });
    }

    public function designation()
    {
        return $this->hasOne(Designation::class, 'id', 'designation_id');
    }

    public function branch()
    {
        return $this->hasOne(Branch::class, 'id', 'branch_id');
    }
}
