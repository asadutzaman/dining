<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateGoodsreceivenoteitemsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('goods_receive_note_items', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();

            $table->bigInteger('goods_receive_note_id')->index()->comment('FK=goods_receive_notes.id');
            $table->bigInteger('item_id')->index()->comment('FK=items.id');
            $table->float('unit_price');
            $table->float('quantity');
            $table->float('total_price')->comment('unit_price * quantity');
            $table->bigInteger('shelve_id')->nullable()->comment('FK=shelves.id');
            $table->date('expire_date')->nullable()->comment('Expire Date');
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
        Schema::dropIfExists('goods_receive_note_items');
    }
}
