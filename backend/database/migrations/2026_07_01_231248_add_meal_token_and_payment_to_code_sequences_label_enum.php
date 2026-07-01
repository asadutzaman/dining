<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

class AddMealTokenAndPaymentToCodeSequencesLabelEnum extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        $table = DB::getTablePrefix() . 'code_sequences';
        DB::statement("ALTER TABLE {$table} MODIFY COLUMN label ENUM('SUPPLIER', 'ITEM', 'REQUISITION', 'GRN', 'STOCK_TRANSFER', 'STOCK_ADJUSTMENT', 'MEMBER', 'MEAL_TOKEN', 'PAYMENT')");
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        $table = DB::getTablePrefix() . 'code_sequences';
        DB::statement("ALTER TABLE {$table} MODIFY COLUMN label ENUM('SUPPLIER', 'ITEM', 'REQUISITION', 'GRN', 'STOCK_TRANSFER', 'STOCK_ADJUSTMENT', 'MEMBER')");
    }
}
