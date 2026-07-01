<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateItemstocksTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('item_stocks', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->tinyInteger('organogram_id')->nullable()->index();

            $table->bigInteger('branch_id');
            $table->bigInteger('item_id');
            $table->bigInteger('shelve_id')->comment('FK=branch_shelves.id')->nullable();
            $table->float('unit_price')->nullable();
            $table->float('quantity');
            $table->float('balance_quantity');
            $table->bigInteger('recordable_id')->index()->comment('FK=records.id');
            $table->string('recordable_type')->comment('record model');
            $table->enum('action_from', ["GRN", "Material_Requisition", "Stock_Transfer", "Stock_Adjustment"]);
            $table->string('remarks')->nullable();

            $table->integer('created_by')->nullable();
            $table->integer('updated_by')->nullable();
            $table->softDeletes();
            $table->timestamps();
            $table->integer('sort_order')->default(0);
            $table->boolean('status')->default(1);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('item_stocks');
    }
}
