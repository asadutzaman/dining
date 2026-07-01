<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class UpdatedMigrationOne extends Migration
{

    public function up()
    {
        //
    }

    public function down()
    {
       //
    }

}

/*
DB::statement("ALTER TABLE `acl`
         ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `controller` (`controller`,`action`), ADD KEY `ghost` (`ghost`);

        ALTER TABLE `acl_to_roles`
        ADD CONSTRAINT `acl_to_roles_ibfk_1` FOREIGN KEY (`acl_id`) REFERENCES `acl` (`id`) ON DELETE CASCADE,
        ADD CONSTRAINT `acl_to_roles_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

        ALTER TABLE `users`
        ADD CONSTRAINT `Role` FOREIGN KEY (`id_role`) REFERENCES `roles` (`id`);
");

Schema::table('walk_location', function(Blueprint $table) {
    DB::statement('alter table walk_location modify request_id int unsigned not null');

    $table->unsignedBigInteger('user_id')->after('id');
    $table->text('settings')->nullable()->after('pack_id');

    $table->foreign('owner_id')->references('id')->on('owner')->onDelete('cascade');
});

Schema::table('events', function(Blueprint $table){
    $table->dropColumn('comment');
    $table->dropForeign(['user_id']);
    if (Schema::hasColumns('events', ['city', 'date_begin'])) {
        $table->dropColumn(['city', 'date_begin']);
    }
});
*/
