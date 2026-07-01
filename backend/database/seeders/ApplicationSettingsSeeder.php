<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ApplicationSetting;
use Database\Seeders\Traits\TruncateTable;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;

class ApplicationSettingsSeeder extends Seeder
{
    use TruncateTable;
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $this->truncateMultiple(['application_settings']);
        $data = file_get_contents('database/seeders/json/applicationSettingsSeeder.json');
        $json_data = json_decode($data, true);

        foreach ($json_data as $item) {
            $type = $item['type'] ?? null;
            $items = $item['items'] ?? null;

            if (!empty($items)) {
                $this->insertData($type, $items);
            }
        }
    }

    protected function insertData($type, $items)
    {
        $now = Carbon::now()->format('Y-m-d H:i:s');
        foreach ($items as $item) {
            $check = ApplicationSetting::where([
                ['type', $type],
                ['option', $item['option']]
            ])->first();
            Log::info($check);

            if (!empty($check)) {
                $updateData = [
                    'value'      => $item['value'],
                    'created_by' => 1,
                    'updated_by' => 1,
                ];
                $check->update($updateData);
            } else {
                $params = [
                    'type'         => $type,
                    'label'        => $item['label'],
                    'option'       => $item['option'],
                    'value'        => $item['value'],
                    'is_changable' => $item['is_changable'],
                    'created_at'   => $now,
                    'updated_at'   => $now,
                    'created_by'   => 1,
                    'updated_by'   => 1,
                ];
                ApplicationSetting::create($params);
            }
        }
    }
}
