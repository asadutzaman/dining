<?php

namespace Database\Seeders;

use App\Models\TaxRate;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Arr;

class TaxRatesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $data = file_get_contents('database/seeders/json/taxRatesTableSeeder.json');
        $jsonData = json_decode($data, true);

        foreach ($jsonData as $data) {
            // Create Oauth Auth Client
            $oauthAuthClient = $this->insertData($data);
        }

        $this->command->info('Tax rates related table seeded!');
    }

    protected function insertData($data)
    {
        if (empty($data)) {
            return null;
        }

        try {
            $now = Carbon::now()->format('Y-m-d H:i:s');
            $oauthAuthClient = TaxRate::where('code', $data['code'])->first();
            if (empty($oauthAuthClient)) {
                $insertData = [
                    "name" => Arr::get($data, 'name', null),
                    "code" => Arr::get($data, 'code', null),
                    "rate" => Arr::get($data, 'rate', null),
                    "type" => Arr::get($data, 'type', null),
                    "created_at" => Arr::get($data, 'created_at', $now),
                    "updated_at" => Arr::get($data, 'updated_at', $now),
                ];
                $oauthAuthClient = TaxRate::create($insertData);
            }

            return $oauthAuthClient;
        } catch (\Exception $e) {
            $this->command->info($e->getMessage());
            return null;
        }
    }
}
