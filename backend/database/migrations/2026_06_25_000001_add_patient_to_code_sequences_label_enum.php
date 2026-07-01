<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class AddPatientToCodeSequencesLabelEnum extends Migration
{
    /**
     * The table prefix is applied automatically by Laravel's Schema builder,
     * but raw DB statements need it explicitly.
     * We read it from the connection config to stay environment-agnostic.
     */
    private function prefixed(string $table): string
    {
        $prefix = DB::getTablePrefix();
        return $prefix . $table;
    }

    public function up()
    {
        $table = $this->prefixed('code_sequences');

        DB::statement("ALTER TABLE {$table} MODIFY COLUMN label ENUM('SUPPLIER','ITEM','REQUISITION','GRN','STOCK_TRANSFER','STOCK_ADJUSTMENT','PATIENT') NOT NULL");
    }

    public function down()
    {
        $table = $this->prefixed('code_sequences');

        DB::statement("ALTER TABLE {$table} MODIFY COLUMN label ENUM('SUPPLIER','ITEM','REQUISITION','GRN','STOCK_TRANSFER','STOCK_ADJUSTMENT') NOT NULL");
    }
}
