
<?php

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ExampleSqlTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $path = 'database/seeders/sql/example.sql';
        DB::unprepared(file_get_contents($path));
        $this->command->info('Example table seeded!');
    }
}
