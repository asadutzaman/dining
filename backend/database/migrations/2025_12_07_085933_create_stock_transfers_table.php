<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateStocktransfersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('stock_transfers', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->tinyInteger('organogram_id')->nullable()->index();

            $table->string('stock_transfer_number')->unique();
            $table->integer('transfer_from')->comment('FK=branch.id')->index();
            // $table->unsignedBigInteger('transfer_to')->comment('FK=branch.id')->index();
            $table->text('transfer_to')->comment('FK=branch.id')->index();
            $table->text('reason')->nullable();
            $table->string('process_status')->default('SUBMITTED')->comment('DRAFT, SUBMITTED');

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
        Schema::dropIfExists('stock_transfers');
    }
}
