<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

class AddMemberToCodeSequencesLabelEnum extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        $table = DB::getTablePrefix() . 'code_sequences';
        DB::statement("ALTER TABLE {$table} MODIFY COLUMN label ENUM('SUPPLIER', 'ITEM', 'REQUISITION', 'GRN', 'STOCK_TRANSFER', 'STOCK_ADJUSTMENT', 'MEMBER')");
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        $table = DB::getTablePrefix() . 'code_sequences';
        DB::statement("ALTER TABLE {$table} MODIFY COLUMN label ENUM('SUPPLIER', 'ITEM', 'REQUISITION', 'GRN', 'STOCK_TRANSFER', 'STOCK_ADJUSTMENT')");
    }
}
