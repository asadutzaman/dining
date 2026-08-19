<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddNcmsFieldsToMemberCandidatesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('member_candidates', function (Blueprint $table) {
            // Stable identity in the source system. Upsert key together with `type`.
            $table->string('external_id')->nullable()->after('type');

            // As reported by NCMS. Deliberately NOT unique: most of the roster has no card,
            // and empty values are stored as NULL so they never collide.
            $table->string('rfid')->nullable()->index()->after('roll_no');

            $table->string('image_url')->nullable()->after('rfid');
            $table->timestamp('synced_at')->nullable()->after('image_url');

            // People who disappear from the API are tombstoned, never deleted: a member may
            // already point at this row via members.candidate_id.
            $table->boolean('is_active')->default(1)->index()->after('synced_at');

            $table->unique(['type', 'external_id']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('member_candidates', function (Blueprint $table) {
            $table->dropUnique(['type', 'external_id']);
            $table->dropColumn(['external_id', 'rfid', 'image_url', 'synced_at', 'is_active']);
        });
    }
}
