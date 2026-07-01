<?php

namespace Database\Seeders\Traits;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Log;

/**
 * Class TruncateTable.
 */
trait TruncateTable
{
    /**
     * @param $table
     *
     * @return bool
     */
    protected function truncate($table)
    {
        switch (DB::getDriverName()) {
            case 'mysql':
            case 'pgsql':
                // Check if table exists
                if (!Schema::hasTable($table)) {
                    Log::warning("Table {$table} does not exist. Skipping truncate.");
                    return false;
                }

                // For PostgreSQL, disable foreign key checks temporarily
                if (DB::getDriverName() === 'pgsql') {
                    return DB::transaction(function () use ($table) {
                        DB::statement('SET CONSTRAINTS ALL DEFERRED');
                        DB::table($table)->truncate();
                        return true;
                    });
                }

                return DB::table($table)->truncate();

            case 'sqlite':
            case 'sqlsrv':
                if (!Schema::hasTable($table)) {
                    return false;
                }
                return DB::statement('DELETE FROM ' . DB::getTablePrefix() . $table);
        }

        return false;
    }

    /**
     * @param array $tables
     */
    protected function truncateMultiple(array $tables)
    {
        foreach ($tables as $table) {
            $this->truncate($table);
        }
    }
}
