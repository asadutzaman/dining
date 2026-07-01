<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateGoodsreceivenotesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('goods_receive_notes', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->tinyInteger('organogram_id')->nullable()->index();

            $table->string('grn_number')->unique();
            $table->bigInteger('branch_id')->index()->comment('FK=branches.id');
            $table->bigInteger('supplier_id')->index()->comment('FK=suppliers.id');
            $table->bigInteger('logistic_id')->index()->comment('FK=logistics.id');
            $table->string('ref_po_number')->nullable();
            $table->string('ref_po_date')->nullable();
            $table->string('ref_challan_no')->nullable();
            $table->date('ref_challan_date');
            $table->date('received_date');
            $table->text('remarks')->nullable();
            $table->string('process_status')->default('Pending')->comment('Pending, Approved');

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
        Schema::dropIfExists('goods_receive_notes');
    }
}
