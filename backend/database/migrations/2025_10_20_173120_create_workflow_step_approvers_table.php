<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateWorkflowStepApproversTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('workflow_step_approvers', function (Blueprint $table) {
            $table->id();

            $table->integer('workflow_id')->comment('FK=workflows.id');
            $table->integer('workflow_step_id')->comment('FK=workflow_steps.id');

            $table->enum('approver_mode', ['USER', 'DESIGNATION'])->default('USER')->comment('USER=specific user, DESIGNATION=role based per BU');
            $table->integer('designation_id')->nullable()->comment('FK=designations.id — used when approver_mode=DESIGNATION');

            $table->integer('approver_group_id')->nullable()->comment('FK=approver_groups.id');
            $table->integer('approver_group_member_id')->nullable()->comment('FK=approver_group_members.id');
            $table->integer('user_id')->nullable()->comment('FK=users.id');
            $table->enum('approver_type', ['PRIMARY_APPROVER', 'ALTERNATE_APPROVER', 'REVIEWER']);
            $table->smallInteger('max_step_backward')->default(0)->comment('0=No');
            $table->smallInteger('max_step_forward')->default(0)->comment('0=No');
            $table->boolean('assign_approver')->default(0)->comment('1=True,0=False');

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
        Schema::dropIfExists('workflow_step_approvers');
    }
}
