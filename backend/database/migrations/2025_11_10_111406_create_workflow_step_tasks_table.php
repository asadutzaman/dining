<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateWorkflowStepTasksTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('workflow_step_tasks', function (Blueprint $table) {
            $table->id();

            $table->integer('workflow_id')->index()->comment('FK=workflows.id');
            $table->integer('workflow_step_id')->index()->comment('FK=workflow_steps.id');
            $table->string('action_name');
            $table->string('action_code');
            $table->string('task_key');
            $table->string('task_type');
            $table->string('field_name');
            $table->string('field_value');

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
        Schema::dropIfExists('workflow_step_tasks');
    }
}
