<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateOrganizationsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('organizations', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->json('component_ids')->nullable();
            $table->integer('parent_id')->nullable();
            $table->string('name_en');
            $table->string('name_bn')->nullable();
            $table->text('description')->nullable();
            $table->string('short_name')->nullable();
            $table->text('short_description')->nullable();
            $table->string('mobile', 32)->nullable();
            $table->string('telephone', 32)->nullable();
            $table->string('email', 64)->nullable();
            $table->integer('sort_order')->nullable();
            $table->string('logo_image')->nullable();

            $table->integer('created_by')->nullable();
            $table->integer('updated_by')->nullable();
            $table->softDeletes();
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
        Schema::dropIfExists('organizations');
    }
}
