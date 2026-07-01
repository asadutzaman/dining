<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateScopesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('scopes', function (Blueprint $table) {
            $table->id();
            $table->integer('resource_id')->index();
            $table->string('scope')->index()->unique('scopes_name_unique')->comment('user.details | user:read:email');
            $table->string('display_name')->nullable()->comment('Get users details');
            $table->string('http_method', 100)->nullable()->comment('GET | POST | PUT | DELETE');
            $table->string('action_name')->nullable();
            $table->string('uri')->nullable()->comment('group/*');
            $table->integer('sort_order')->default(0);
            $table->integer('created_by')->nullable();
            $table->integer('updated_by')->nullable();
            $table->timestamps();
            $table->tinyInteger('status')->default(1);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('scopes');
    }
}
