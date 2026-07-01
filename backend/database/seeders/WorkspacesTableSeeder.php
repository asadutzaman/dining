<?php

namespace Database\Seeders;

use App\Repositories\UserRepository;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use App\Models\Workspace;
use Illuminate\Support\Arr;


class WorkspacesTableSeeder extends Seeder
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
        $data = file_get_contents('database/seeders/json/workspacesTableSeeder.json');
        $jsonData = json_decode($data, true);

        $now = Carbon::now()->format('Y-m-d H:i:s');
        foreach ($jsonData as $data) {
            Workspace::create(array(
                "id" => Arr::get($data, 'id', null),
                "organization_id" => Arr::get($data, 'organization_id', null),
                "name" => Arr::get($data, 'name', null),
                "description" => Arr::get($data, 'description', null),
                'created_by' => 1,
                'updated_by' => 1,
                // "created_by" => Arr::get($data, 'created_by', Arr::get($this->adminUserInfo, 'id', 1)),
                // "updated_by" => Arr::get($data, 'updated_by', Arr::get($this->adminUserInfo, 'id', 1)),
                "created_at" => Arr::get($data, 'created_at', $now),
                "updated_at" => Arr::get($data, 'updated_at', $now),
                "status" => Arr::get($data, 'status', 1)
            ));
        }
    }
}
