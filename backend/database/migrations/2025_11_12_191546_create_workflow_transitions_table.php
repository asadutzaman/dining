<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateWorkflowTransitionsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('workflow_transitions', function (Blueprint $table) {
            $table->id();

            $table->integer('workflow_id');
            $table->integer('workflow_step_id');
            $table->integer('workflow_record_id');
            $table->string('workflow_action_name')->nullable();
            $table->string('workflow_action_code', 64)->nullable();
            $table->string('workflow_action_alias_text')->nullable();
            $table->string('workflow_action_button_color', 64)->nullable();
            $table->text('comment')->nullable();

            $table->integer('created_by')->nullable();
            $table->integer('updated_by')->nullable();
            $table->softDeletes();
            $table->timestamps();
            $table->integer('sort_order')->default(0);
            $table->boolean('status')->default(1);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('workflow_transitions');
    }
}
