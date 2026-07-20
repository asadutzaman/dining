<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateMealBookingsTable extends Migration
{
    /**
     * A member's intent to eat a given meal on a given day, made from the app
     * ahead of the meal's cutoff. This is the source of truth for kitchen counts;
     * the meal_token issued at the counter links back to the booking it satisfied.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('meal_bookings', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();

            $table->unsignedBigInteger('member_id');
            $table->date('meal_date');
            $table->string('meal_type'); // BREAKFAST, LUNCH, DINNER

            // Price and cutoff are snapshotted at booking time so that later edits
            // to meal_settings never silently rewrite what a member was quoted.
            $table->decimal('unit_price', 10, 2);
            $table->dateTime('cutoff_at')->nullable();

            $table->string('booking_status')->default('BOOKED'); // BOOKED, CANCELLED, CONSUMED, MISSED
            $table->string('charge_status')->default('PENDING'); // PENDING, CHARGED, WAIVED
            $table->decimal('charged_amount', 10, 2)->default(0);

            $table->string('source')->default('APP'); // APP, COUNTER, ADMIN

            $table->dateTime('booked_at');
            $table->dateTime('cancelled_at')->nullable();
            $table->dateTime('settled_at')->nullable();

            $table->unsignedBigInteger('meal_token_id')->nullable();

            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();
            $table->boolean('status')->default(1)->index();

            $table->foreign('member_id')->references('id')->on('members')->onDelete('cascade');
            $table->foreign('meal_token_id')->references('id')->on('meal_tokens')->onDelete('set null');

            /*
             * Index names are given explicitly throughout: the configured table
             * prefix pushes Laravel's auto-generated names past MySQL's 64
             * character identifier limit.
             */

            // Exactly one row per member/meal/day. Cancelling flips booking_status
            // rather than deleting, and re-booking reuses the row -- which is
            // precisely the toggle semantics of the weekly grid. Deliberately no
            // soft deletes: they would defeat this unique key.
            $table->unique(['member_id', 'meal_date', 'meal_type'], 'mb_member_date_meal_unique');

            // Kitchen counts: "how many lunches are booked for the 14th".
            $table->index(['meal_date', 'meal_type', 'booking_status'], 'mb_date_meal_status_index');
            // The app's week grid and bookings list.
            $table->index(['member_id', 'meal_date'], 'mb_member_date_index');
            // The nightly no-show settlement sweep.
            $table->index(['booking_status', 'charge_status'], 'mb_booking_charge_status_index');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('meal_bookings');
    }
}
