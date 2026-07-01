<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateUserSettingsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('user_settings', function (Blueprint $table) {
            $table->id();
            $table->integer('user_id');
            $table->string('web_device_token')->nullable();
            $table->string('mobile_device_token')->nullable();
            $table->tinyInteger('email_notification')->default(1);;
            $table->tinyInteger('sms_notification')->default(1);;
            $table->tinyInteger('mobile_push_notification')->default(1);;
            $table->tinyInteger('web_push_notification')->default(1);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('user_settings');
    }
}
