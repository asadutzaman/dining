<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateMemberOtpsTable extends Migration
{
    /**
     * One-time codes for member login. The code itself is never stored in the
     * clear -- only a hash -- so a database leak cannot be replayed as a login.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('member_otps', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();

            $table->string('phone');
            // Nullable: a code may be requested for a phone that matches no member,
            // and we still record the attempt for rate limiting without leaking
            // whether the number is enrolled.
            $table->unsignedBigInteger('member_id')->nullable();

            $table->string('otp_hash');
            $table->dateTime('expires_at');
            $table->dateTime('consumed_at')->nullable();
            $table->unsignedSmallInteger('attempt_count')->default(0);

            $table->string('request_ip', 45)->nullable();

            $table->timestamps();

            $table->foreign('member_id')->references('id')->on('members')->onDelete('cascade');

            // Verification looks up the newest unconsumed code for a phone.
            $table->index(['phone', 'expires_at']);
            // Rate limiting counts recent requests per phone.
            $table->index(['phone', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('member_otps');
    }
}
