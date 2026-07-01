<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Enum;
use Illuminate\Support\Carbon;

class EnumSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $data = file_get_contents('database/seeders/json/enumsSeeder.json');
        $json_data = json_decode($data, true);

        foreach ($json_data as $item) {
            $enumType = $item['type'] ?? null;
            $enumitems = $item['items'] ?? null;

            if (!empty($enumType) && !empty($enumitems)) {
                $this->insertEnums($enumType, $enumitems);
            }
        }
    }

    protected function insertEnums($enumType, $enumitems)
    {
        $now = Carbon::now()->format('Y-m-d H:i:s');
        foreach ($enumitems as $item) {
            $enuminfo = Enum::where([
                ['type', $enumType],
                ['key', $item['key']]
            ])->first();

            if (!empty($enuminfo)) {
                $updateData = [
                    'value' => $item['value'],
                ];
                $enuminfo->update($updateData);
            } else {
                $enumData = [
                    'type'       => $enumType,
                    'key'        => $item['key'],
                    'value'      => $item['value'],
                    'created_at' => $now,
                    'updated_at' => $now,
                    'status'     => 1
                ];
                Enum::create($enumData);
            }
        }
    }
}
