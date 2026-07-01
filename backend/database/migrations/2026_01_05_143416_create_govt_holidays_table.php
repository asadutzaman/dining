<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateGovtHolidaysTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('govt_holidays', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->tinyInteger('organogram_id')->nullable()->index();

            $table->string('name')->nullable()->comment('e.g. New Year, Christmas, etc.');
            $table->tinyInteger('day')->nullable()->comment('1-31');
            $table->tinyInteger('month')->nullable()->comment('1-12');
            $table->integer('year')->nullable()->comment('YYYY');
            $table->date('date')->nullable()->comment('YYYY-MM-DD');
            $table->string('holiday_type')->nullable()->comment('e.g. public_holiday, bank_holiday, etc.');

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
        Schema::dropIfExists('govt_holidays');
    }
}
