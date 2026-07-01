<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePaymentsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();

            $table->string('payment_number')->unique();
            $table->unsignedBigInteger('member_id')->index();
            $table->decimal('amount', 10, 2);
            $table->date('payment_date')->index();
            $table->string('payment_method')->default('CASH');
            $table->string('remarks')->nullable();
            $table->unsignedBigInteger('collected_by')->nullable();

            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->softDeletes();
            $table->timestamps();
            $table->boolean('status')->default(1);

            $table->foreign('member_id')->references('id')->on('members')->onDelete('restrict');
            $table->foreign('collected_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('payments');
    }
}
