<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateWorkflowTransitionAssignmentsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('workflow_transition_assignments', function (Blueprint $table) {
            $table->id();

            $table->integer('workflow_id')->index()->comment('FK=workflows.id');
            $table->integer('workflow_step_id')->index()->comment('FK=workflow_steps.id');
            $table->unsignedBigInteger('workflow_record_id')->index()->comment('FK=workflow_steps.id');
            $table->string('workflow_record_from')->comment('Model name');
            $table->unsignedBigInteger('workflow_transition_id')->index()->comment('FK=workflow_transitions.id');
            $table->integer('assigned_to')->comment('FK=users.id');
            $table->integer('assigned_by')->comment('FK=users.id');

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
        Schema::dropIfExists('workflow_transition_assignments');
    }
}
