<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateItemStockOutHistoriesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('item_stock_out_histories', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->tinyInteger('organogram_id')->nullable()->index();

            $table->unsignedBigInteger('branch_id')->comment('FK=branches.id')->index();
            $table->unsignedBigInteger('item_stock_id')->comment('FK=item_stocks.id')->index();
            $table->unsignedBigInteger('item_id')->comment('FK=items.id')->index();
            $table->decimal('quantity', 15, 2);
            $table->unsignedBigInteger('recordable_id')->comment('FK=records table.id')->index();
            $table->string('recordable_type')->comment('Model Name of records table');
            $table->string('action_from')->nullable()->comment('STOCK_TRANSFER, STOCK_ADJUSTMENT, ITEM_CONSUMPTION');
            $table->string('remarks')->nullable()->comment('branch_name/action_from/recordable_id_no');

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
        Schema::dropIfExists('item_stock_out_histories');
    }
}
