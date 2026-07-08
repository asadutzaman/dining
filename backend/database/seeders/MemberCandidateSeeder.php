<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Dining\MemberCandidate;

class MemberCandidateSeeder extends Seeder
{
    /**
     * Example staging roster for the "Add Member From API" picker.
     * Replace/extend with real data once a real source system is available.
     */
    public function run()
    {
        $candidates = [
            ['name' => 'Asadujjaman', 'type' => 'student', 'roll_no' => '54'],
            ['name' => 'Fahim Ahmed', 'type' => 'staff', 'staff_id' => '234'],
            ['name' => 'Nusrat Jahan', 'type' => 'student', 'roll_no' => '61'],
            ['name' => 'Rezaul Karim', 'type' => 'staff', 'staff_id' => '271'],
            ['name' => 'Tanvir Hasan', 'type' => 'student', 'roll_no' => '18'],
        ];

        foreach ($candidates as $candidate) {
            MemberCandidate::firstOrCreate(
                ['name' => $candidate['name'], 'type' => $candidate['type']],
                $candidate
            );
        }

        $this->command->info('Member candidates seeded: ' . count($candidates));
    }
}
