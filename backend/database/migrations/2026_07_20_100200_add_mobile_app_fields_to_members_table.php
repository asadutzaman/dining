<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddMobileAppFieldsToMembersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('members', function (Blueprint $table) {
            // App language. Labels are rendered in both scripts, this picks the primary.
            $table->string('language', 2)->default('en')->after('email'); // en, bn

            // Notification preferences (screen 1f).
            $table->boolean('notify_booking_reminder')->default(true)->after('language');
            $table->boolean('notify_cutoff_warning')->default(true)->after('notify_booking_reminder');
            $table->boolean('notify_weekly_summary')->default(false)->after('notify_cutoff_warning');

            $table->dateTime('last_login_at')->nullable()->after('notify_weekly_summary');

            // Members log in with their phone number, so it must be looked up on
            // every OTP request. Intentionally a plain index rather than unique:
            // existing rows are not guaranteed to have distinct phones, so the
            // "exactly one active member for this phone" rule is enforced in
            // MemberAuthService where it can produce a useful error message.
            $table->index('phone');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('members', function (Blueprint $table) {
            $table->dropIndex(['phone']);
            $table->dropColumn([
                'language',
                'notify_booking_reminder',
                'notify_cutoff_warning',
                'notify_weekly_summary',
                'last_login_at',
            ]);
        });
    }
}
