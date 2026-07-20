<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateMemberNotificationsTable extends Migration
{
    /**
     * The in-app notification feed (screen 1g). Persisted server-side rather than
     * derived from push, so the feed survives a reinstall and reads consistently
     * across devices.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('member_notifications', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();

            $table->unsignedBigInteger('member_id');

            // CUTOFF_WARNING, BOOKING_CONFIRMED, BOOKING_CANCELLED,
            // BOOKING_REMINDER, WEEKLY_PLAN_SAVED, WEEKLY_SUMMARY
            $table->string('type')->index();
            $table->string('title');
            $table->text('body');

            // Deep link target, e.g. "booking/2026-07-12/DINNER".
            $table->string('action_route')->nullable();
            // Structured payload for the client to render without parsing prose.
            $table->json('data')->nullable();

            $table->dateTime('read_at')->nullable();
            $table->dateTime('dismissed_at')->nullable();

            $table->timestamps();

            $table->foreign('member_id')->references('id')->on('members')->onDelete('cascade');

            // Explicit names: the table prefix would push the generated ones close
            // to MySQL's 64 character identifier limit.
            // The feed itself: newest first for one member.
            $table->index(['member_id', 'created_at'], 'mn_member_created_index');
            // The unread badge count.
            $table->index(['member_id', 'read_at'], 'mn_member_read_index');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('member_notifications');
    }
}
