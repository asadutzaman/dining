<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Repositories\UserRepository;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Arr;

class UsersSeeder extends Seeder
{
    private $adminUserInfo;

    public function __construct()
    {
        $userRepository = new UserRepository();
        $adminUserInfo = $userRepository->getAdminUserInfo();
        $this->adminUserInfo = $adminUserInfo;
    }

    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $data = file_get_contents('database/seeders/json/usersSeeder.json');
        $jsonData = json_decode($data, true);
        $now = Carbon::now()->format('Y-m-d H:i:s');
        foreach ($jsonData as $key => $data) {
            // CREATE ROLE
            $role = $this->createRole($data);
            if (empty($role)) {
                continue;
            }

            // CREATE GROUP
            $roleId = Arr::get($role, 'id', null);

            // CREATE USER
            $this->createUser($data, $roleId);
        }

        $this->command->info('Users, Roles and Groups table seeded!');
    }

    protected function createRole($data)
    {
        if (empty($data)) {
            return null;
        }

        try {
            $now = Carbon::now()->format('Y-m-d H:i:s');
            $role = Role::where('code', $data['code'])->first();
            if (empty($role)) {
                $insertData = [
                    "code" => Arr::get($data, 'code', null),
                    "name" => Arr::get($data, 'name', null),
                    "description" => Arr::get($data, 'description', null),

                    "organogram_id" => 1,
                    "created_by" => 1,
                    "updated_by" => 1,
                    "created_at" => Arr::get($data, 'created_at', $now),
                    "updated_at" => Arr::get($data, 'updated_at', $now),
                    "status" => Arr::get($data, 'status', 1)
                ];
                $role = Role::create($insertData);
            }

            return $role;
        } catch (\Exception $e) {
            $this->command->info($e->getMessage());
            return null;
        }
    }

    protected function createUser($jsonData, $roleId)
    {
        $items = Arr::get($jsonData, 'users', null);
        if (empty($items)) {
            return null;
        }

        try {
            $now = Carbon::now()->format('Y-m-d H:i:s');
            foreach ($items as $data) {
                $user = User::where('email', $data['email'])->first();
                if (empty($user)) {
                    $insertData = [
                        "name" => Arr::get($data, 'first_name', null) . ' ' . Arr::get($data, 'last_name', null),
                        "first_name" => Arr::get($data, 'first_name', null),
                        "last_name" => Arr::get($data, 'last_name', null),
                        "email" => Arr::get($data, 'email', null),
                        "phone" => Arr::get($data, 'phone', null),
                        "password" => Arr::get($data, 'password', null),
                        "user_type" => Arr::get($data, 'user_type', null),

                        "organization_ids" => array("1"),
                        "organogram_ids" => array("1"),
                        "web_access" => 1,
                        "app_access" => 1,
                        "timezone" => "UTC",
                        "locale" => "en",
                        "role_ids" => [$roleId],
                        'created_by' => 1,
                        'updated_by' => 1,
                        // "created_by" => Arr::get($data, 'created_by', Arr::get($this->adminUserInfo, 'id', 1)),
                        // "updated_by" => Arr::get($data, 'updated_by', Arr::get($this->adminUserInfo, 'id', 1)),
                        "created_at" => Arr::get($data, 'created_at', $now),
                        "updated_at" => Arr::get($data, 'updated_at', $now),
                        "status" => Arr::get($data, 'status', 1)
                    ];
                    User::create($insertData);
                }
            }
        } catch (\Exception $e) {
            $this->command->info($e->getMessage());
            return null;
        }
    }
}
