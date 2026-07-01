<?php

namespace Database\Seeders;

use App\Repositories\UserRepository;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use App\Models\Organization;
use Illuminate\Support\Arr;

class OrganizationsTableSeeder extends Seeder
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
        $data = file_get_contents('database/seeders/json/organizationsTableSeeder.json');
        $json_data = json_decode($data, true);

        $now = Carbon::now()->format('Y-m-d H:i:s');

        foreach ($json_data as $data) {
            Organization::create(array(
                "id" => Arr::get($data, 'id', null),
                "name_en" => Arr::get($data, 'name_en', null),
                "short_name" => Arr::get($data, 'short_name', null),
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
