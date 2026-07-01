<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateScopeActionsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('scope_actions', function (Blueprint $table) {
            $table->id();
            $table->integer('resource_id')->index();
            $table->integer('scope_id')->index();
            $table->string('http_method', 100)->nullable()->comment('GET | POST | PUT | DELETE');
            $table->string('action_name')->nullable();
            $table->string('uri')->nullable()->comment('group/*');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('scope_actions');
    }
}
