<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateFilesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('files', function (Blueprint $table) {
            $table->string('file_id', 32)->unique()->index();
            $table->integer('folder_id')->nullable();
            $table->string('filename');
            $table->string('original_filename');
            $table->string('file_type')->nullable();
            $table->string('mime_type')->nullable();
            $table->string('file_path');
            $table->string('file_url')->nullable();
            $table->string('ext')->nullable();
            $table->double('size')->comment('Size of file in bytes');
            $table->string('width')->nullable();
            $table->string('height')->nullable();
            $table->unsignedBigInteger('downloads')->default(0);
            $table->unsignedBigInteger('views')->default(0);
            $table->string('password')->nullable();
            $table->boolean('is_public')->default(true);
            $table->longText('meta')->nullable();
            $table->unsignedBigInteger('owner_id')->nullable();
            $table->integer('sort_order')->default(0);
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('files');
    }
}
