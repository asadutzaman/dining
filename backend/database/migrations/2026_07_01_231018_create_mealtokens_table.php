<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateMealTokensTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('meal_tokens', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();

            $table->string('token_number')->unique();
            $table->unsignedBigInteger('member_id')->index();
            $table->string('meal_type')->index(); // BREAKFAST, LUNCH, DINNER
            $table->date('meal_date')->index();
            $table->decimal('amount', 10, 2);

            $table->string('payment_status')->index(); // PAID, DUE
            $table->string('payment_method')->nullable(); // CASH (only set when PAID)

            $table->string('collection_status')->default('ISSUED')->index(); // ISSUED, COLLECTED
            $table->timestamp('collected_at')->nullable();
            $table->unsignedBigInteger('collected_by')->nullable();
            $table->unsignedBigInteger('issued_by')->nullable();

            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->softDeletes();
            $table->timestamps();
            $table->boolean('status')->default(1);

            // One token per member per meal per day
            $table->unique(['member_id', 'meal_type', 'meal_date']);

            $table->foreign('member_id')->references('id')->on('members')->onDelete('restrict');
            $table->foreign('collected_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('issued_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('meal_tokens');
    }
}
