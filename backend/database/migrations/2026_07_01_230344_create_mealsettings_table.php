<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateMealsettingsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('meal_settings', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();

            $table->string('meal_type')->index(); // BREAKFAST, LUNCH, DINNER
            $table->decimal('cost', 10, 2);
            $table->date('effective_from')->index();

            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->softDeletes();
            $table->timestamps();
            $table->boolean('status')->default(1)->index();

            $table->unique(['meal_type', 'effective_from']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('meal_settings');
    }
}
