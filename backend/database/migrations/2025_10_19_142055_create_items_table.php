<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateItemsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('items', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->tinyInteger('organogram_id')->nullable()->index();

            $table->enum('type', ["CONSUMABLE", "NON_CONSUMABLE"]);
            $table->bigInteger('logistic_id')->index()->comment('FK=logistics.id');
            $table->bigInteger('item_category_id')->index()->comment('FK=item_categories.id');
            $table->bigInteger('brand_id')->index()->comment('FK=brands.id');
            $table->string('code')->unique()->comment('Based on Logistic');
            $table->string('name_en');
            $table->string('name_bn');
            // $table->string('name_code')->unique();
            $table->string('description')->nullable();
            $table->bigInteger('base_unit_id')->index()->comment('FK=units.id');
            $table->float('reorder_qty')->default(0);

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
        Schema::dropIfExists('items');
    }
}
