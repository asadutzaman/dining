<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CodeSequence;
use Database\Seeders\Traits\TruncateTable;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class CodeSequenceSeeder extends Seeder
{
    use TruncateTable;
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $this->truncateMultiple([
            'code_sequences',
        ]);
        $data = file_get_contents('database/seeders/json/codeSequencesSeeder.json');
        $json_data = json_decode($data, true);

        foreach ($json_data as $item) {

            if (!empty($item)) {
                $this->insertCodeSequences($item);
            }
        }
    }

    protected function insertCodeSequences($item)
    {
        $now = Carbon::now()->format('Y-m-d H:i:s');

        $label = $item['label'] ?? null;
        $prefix = $item['prefix'] ?? null;

        $codeSequenceInfo = CodeSequence::where('label', $label)
            ->where('prefix', $prefix)
            ->first();

        if (!empty($codeSequenceInfo)) {
            $updateData = [
                'separator' => $item['separator'],
                'next_sequence' => $item['next_sequence'],
                'updated_at' => $now,
                'sort_order' => $item['sort_order'] ?? 0,
                'status' => $item['status'] ?? 1
            ];
            $codeSequenceInfo->update($updateData);
        } else {
            $codeSequenceData = [
                'label' => $label,
                'prefix' => $prefix,
                'separator' => $item['separator'],
                'next_sequence' => $item['next_sequence'],
                'created_by' => $item['created_by'] ?? null,
                'updated_by' => $item['updated_by'] ?? null,
                'sort_order' => $item['sort_order'] ?? 0,
                'status' => $item['status'] ?? 1,
                'created_at' => $now,
                'updated_at' => $now,
            ];


            CodeSequence::create($codeSequenceData);
        }
    }
}
