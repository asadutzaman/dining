<?php

/** @var \Illuminate\Database\Eloquent\Factory $factory */

use App\Constants\Common;
use App\Models\User;
use Faker\Generator as Faker;

$factory->define(User::class, function (Faker $faker) {
    return [
        'uuid' => $faker->unique()->uuid,
        'organization_id' => 1,
        'organogram_id' => 1,
        'role_ids' => 1,
        // 'group_ids' => 1,
        // 'manager_id' => null,
        'name' => $faker->name,
        'company_name' => $faker->company,
        'mobile' => $faker->phoneNumber,
        'username' => $faker->userName,
        'email' => $faker->unique()->safeEmail,
        'email_verified_at' => date('Y-m-d H:i:s'),
        'password' => '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        'status' => Common::STATUS_ACTIVE
    ];
});
