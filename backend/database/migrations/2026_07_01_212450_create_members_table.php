<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateMembersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('members', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();

            $table->string('member_code')->unique();
            $table->string('rfid_card_number')->nullable()->unique();
            $table->string('member_type')->index(); // STAFF, STUDENT
            $table->string('name');
            $table->string('phone')->nullable();
            $table->string('email')->nullable();

            // STAFF fields
            $table->unsignedBigInteger('department_id')->nullable()->index();
            $table->unsignedBigInteger('designation_id')->nullable()->index();

            // STUDENT fields
            $table->string('class_name')->nullable();
            $table->string('section')->nullable();
            $table->string('roll_no')->nullable();

            // Denormalized running due balance (justified: read on every token/payment screen)
            $table->decimal('due_balance', 10, 2)->default(0);

            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->softDeletes();
            $table->timestamps();
            $table->boolean('status')->default(1)->index();

            $table->foreign('department_id')->references('id')->on('departments')->onDelete('set null');
            $table->foreign('designation_id')->references('id')->on('designations')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('members');
    }
}
