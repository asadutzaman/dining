<?php

namespace Database\Seeders;

use App\Models\OauthAuthClient;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Arr;

class OauthAuthClientsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $data = file_get_contents('database/seeders/json/oauthAuthClientsTableSeeder.json');
        $jsonData = json_decode($data, true);

        foreach ($jsonData as $data) {
            // Create Oauth Auth Client
            $oauthAuthClient = $this->createOauthAuthClient($data);
        }

        $this->command->info('Oauth related table seeded!');
    }

    protected function createOauthAuthClient($data)
    {
        if (empty($data)) {
            return null;
        }

        try {
            $now = Carbon::now()->format('Y-m-d H:i:s');
            $oauthAuthClient = OauthAuthClient::where('client_id', $data['client_id'])->first();
            if (empty($oauthAuthClient)) {
                $insertData = [
                    "name" => Arr::get($data, 'name', null),
                    "user_id" => Arr::get($data, 'user_id', null),
                    "client_id" => Arr::get($data, 'client_id', null),
                    "client_secret" => Arr::get($data, 'client_secret', null),
                    "password_client" => Arr::get($data, 'password_client', 0),
                    "is_default" => Arr::get($data, 'is_default', 0),

                    "created_at" => Arr::get($data, 'created_at', $now),
                    "updated_at" => Arr::get($data, 'updated_at', $now),
                ];
                $oauthAuthClient = OauthAuthClient::create($insertData);
            }

            return $oauthAuthClient;
        }
        catch (\Exception $e) {
            $this->command->info($e->getMessage());
            return null;
        }
    }
}
