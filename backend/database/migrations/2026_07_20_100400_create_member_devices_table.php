<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateMemberDevicesTable extends Migration
{
    /**
     * Push targets. A member may have several devices; a device may be handed to
     * a different member, so the push token -- not the member -- is the unique key.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('member_devices', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();

            $table->unsignedBigInteger('member_id');
            $table->string('push_token')->unique();
            $table->string('platform', 16)->default('ANDROID'); // ANDROID, IOS
            $table->string('app_version', 32)->nullable();
            $table->string('device_model')->nullable();
            $table->dateTime('last_seen_at')->nullable();

            $table->timestamps();
            $table->boolean('status')->default(1)->index();

            $table->foreign('member_id')->references('id')->on('members')->onDelete('cascade');

            // Fan-out when sending to one member's devices.
            $table->index(['member_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('member_devices');
    }
}
