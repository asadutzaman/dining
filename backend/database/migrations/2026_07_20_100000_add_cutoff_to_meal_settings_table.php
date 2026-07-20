<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddCutoffToMealSettingsTable extends Migration
{
    /**
     * Booking cutoffs are expressed relative to the meal date, not as an absolute
     * clock time, because they can fall on the previous day:
     *
     *   BREAKFAST -> offset -1, time 21:00  ("9:00 PM the night before")
     *   LUNCH     -> offset  0, time 10:00  ("10:00 AM same day")
     *   DINNER    -> offset  0, time 15:00  ("3:00 PM same day")
     *
     * A null cutoff_time means the meal has no pre-booking deadline.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('meal_settings', function (Blueprint $table) {
            $table->smallInteger('cutoff_day_offset')->default(0)->after('end_time');
            $table->time('cutoff_time')->nullable()->after('cutoff_day_offset');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('meal_settings', function (Blueprint $table) {
            $table->dropColumn(['cutoff_day_offset', 'cutoff_time']);
        });
    }
}
