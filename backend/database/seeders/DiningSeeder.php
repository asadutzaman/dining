<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Database\Seeders\Traits\DisableForeignKeys;
use Database\Seeders\Traits\TruncateTable;
use App\Models\Department;
use App\Models\Designation;
use App\Models\Dining\Member;
use App\Models\Dining\MealSetting;
use App\Models\Dining\Payment;

class DiningSeeder extends Seeder
{
    use DisableForeignKeys, TruncateTable;

    // Meal price history: old price + newer price (effective 2 months ago)
    private $mealPrices = [
        'BREAKFAST' => ['old' => 25, 'new' => 30],
        'LUNCH'     => ['old' => 55, 'new' => 60],
        'DINNER'    => ['old' => 45, 'new' => 50],
    ];

    public function run()
    {
        $this->disableForeignKeys();

        // Fresh dining data on every run
        $this->truncateMultiple(['payments', 'meal_tokens', 'meal_settings', 'members']);
        DB::table('code_sequences')
            ->whereIn('label', ['MEMBER', 'MEAL_TOKEN', 'PAYMENT'])
            ->update(['next_sequence' => 1]);

        $faker = fake();
        $newEffective = Carbon::today()->subMonths(2)->startOfDay();

        // ---- Supporting master data (create only if empty) ----
        $departmentIds = $this->ensureDepartments();
        $designationIds = $this->ensureDesignations();

        // ---- Meal settings (price history) ----
        $this->seedMealSettings();

        // ---- Members ----
        $memberCount = 40;
        $staffCount = 16;
        $members = [];   // id => ['type' => , 'due' => 0]
        for ($i = 1; $i <= $memberCount; $i++) {
            $isStaff = $i <= $staffCount;
            $data = [
                'member_code'      => 'MEM-' . $i,
                'rfid_card_number' => 'RFID' . str_pad((string) $i, 5, '0', STR_PAD_LEFT),
                'member_type'      => $isStaff ? 'STAFF' : 'STUDENT',
                'name'             => $faker->name(),
                'phone'            => '01' . $faker->numerify('#########'),
                'email'            => $faker->boolean(60) ? $faker->unique()->safeEmail() : null,
                'status'           => $faker->boolean(95) ? 1 : 0,
            ];
            if ($isStaff) {
                $data['department_id'] = $faker->randomElement($departmentIds);
                $data['designation_id'] = $faker->randomElement($designationIds);
            } else {
                $data['class_name'] = (string) $faker->numberBetween(6, 10);
                $data['section'] = $faker->randomElement(['A', 'B', 'C']);
                $data['roll_no'] = (string) $faker->numberBetween(1, 60);
            }
            $member = Member::create($data);
            $members[$member->id] = ['type' => $member->member_type, 'active' => $member->status == 1, 'due' => 0.0];
        }

        // ---- Meal tokens across the last 30 days ----
        $today = Carbon::today();
        $tokenRows = [];
        $tokenNo = 0;
        $now = Carbon::now();

        for ($d = 29; $d >= 0; $d--) {
            $date = $today->copy()->subDays($d);
            $dateStr = $date->format('Y-m-d');
            $isToday = $d === 0;

            foreach ($members as $memberId => &$m) {
                if (!$m['active']) {
                    continue;
                }
                if (!$faker->boolean(50)) {
                    continue; // member did not eat that day
                }
                $meals = $faker->randomElements(['BREAKFAST', 'LUNCH', 'DINNER'], $faker->numberBetween(1, 3));
                foreach ($meals as $mealType) {
                    $amount = $this->costFor($mealType, $date, $newEffective);
                    $paid = $faker->boolean(65);
                    // Older days mostly collected; today mostly still issued
                    if ($isToday) {
                        $collected = $faker->boolean(30);
                    } else {
                        $collected = $faker->boolean(92);
                    }

                    $tokenNo++;
                    $tokenRows[] = [
                        'uuid'              => Str::uuid()->toString(),
                        'token_number'      => 'TKN-' . $tokenNo,
                        'member_id'         => $memberId,
                        'meal_type'         => $mealType,
                        'meal_date'         => $dateStr,
                        'amount'            => $amount,
                        'payment_status'    => $paid ? 'PAID' : 'DUE',
                        'payment_method'    => $paid ? 'CASH' : null,
                        'collection_status' => $collected ? 'COLLECTED' : 'ISSUED',
                        'collected_at'      => $collected ? $date->copy()->setTime(12, 0)->format('Y-m-d H:i:s') : null,
                        'collected_by'      => $collected ? 1 : null,
                        'issued_by'         => 1,
                        'created_by'        => 1,
                        'updated_by'        => 1,
                        'created_at'        => $date->copy()->setTime(8, 0)->format('Y-m-d H:i:s'),
                        'updated_at'        => $now->format('Y-m-d H:i:s'),
                        'status'            => 1,
                    ];

                    if (!$paid) {
                        $m['due'] += $amount;
                    }
                }
            }
            unset($m);
        }

        foreach (array_chunk($tokenRows, 500) as $chunk) {
            DB::table('meal_tokens')->insert($chunk);
        }

        // ---- Payments: ~60% of members with a due balance pay a partial amount ----
        $paymentNo = 0;
        foreach ($members as $memberId => &$m) {
            if ($m['due'] <= 0 || !$faker->boolean(60)) {
                continue;
            }
            // Collect between 30% and 90% of the outstanding due
            $portion = $faker->randomFloat(2, 0.3, 0.9);
            $amount = round($m['due'] * $portion, 2);
            if ($amount <= 0) {
                continue;
            }

            $paymentNo++;
            $payDate = $today->copy()->subDays($faker->numberBetween(0, 20));
            Payment::create([
                'payment_number' => 'PAY-' . $paymentNo,
                'member_id'      => $memberId,
                'amount'         => $amount,
                'payment_date'   => $payDate->format('Y-m-d'),
                'payment_method' => 'CASH',
                'remarks'        => $faker->boolean(30) ? 'Monthly dues settlement' : null,
            ]);
            $m['due'] = round($m['due'] - $amount, 2);
        }
        unset($m);

        // ---- Sync member running due balances ----
        foreach ($members as $memberId => $m) {
            Member::where('id', $memberId)->update(['due_balance' => $m['due']]);
        }

        // ---- Advance code sequences so real creates continue numbering ----
        DB::table('code_sequences')->where('label', 'MEMBER')->update(['next_sequence' => $memberCount + 1]);
        DB::table('code_sequences')->where('label', 'MEAL_TOKEN')->update(['next_sequence' => $tokenNo + 1]);
        DB::table('code_sequences')->where('label', 'PAYMENT')->update(['next_sequence' => $paymentNo + 1]);

        $this->enableForeignKeys();

        $this->command->info("Dining seeded: {$memberCount} members, {$tokenNo} meal tokens, {$paymentNo} payments.");
    }

    private function costFor(string $mealType, Carbon $date, Carbon $newEffective): float
    {
        $prices = $this->mealPrices[$mealType];
        return (float) ($date->gte($newEffective) ? $prices['new'] : $prices['old']);
    }

    private function seedMealSettings(): void
    {
        $oldFrom = Carbon::today()->subMonths(6)->format('Y-m-d');
        $newFrom = Carbon::today()->subMonths(2)->format('Y-m-d');
        foreach ($this->mealPrices as $type => $prices) {
            MealSetting::create(['meal_type' => $type, 'cost' => $prices['old'], 'effective_from' => $oldFrom, 'status' => 0]);
            MealSetting::create(['meal_type' => $type, 'cost' => $prices['new'], 'effective_from' => $newFrom, 'status' => 1]);
        }
    }

    private function ensureDepartments(): array
    {
        $ids = Department::query()->pluck('id')->toArray();
        if (!empty($ids)) {
            return $ids;
        }
        foreach (['Administration', 'Faculty', 'Library', 'Sports', 'IT'] as $name) {
            $ids[] = Department::create(['name' => $name])->id;
        }
        return $ids;
    }

    private function ensureDesignations(): array
    {
        $ids = Designation::query()->pluck('id')->toArray();
        if (!empty($ids)) {
            return $ids;
        }
        foreach (['Professor', 'Lecturer', 'Officer', 'Assistant', 'Coordinator'] as $title) {
            $ids[] = Designation::create(['title' => $title])->id;
        }
        return $ids;
    }
}
