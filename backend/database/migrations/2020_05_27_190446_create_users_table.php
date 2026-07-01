<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->integer('doptor_user_id')->nullable();
            $table->text('organization_ids')->nullable();
            $table->text('organogram_ids')->nullable();
            // $table->text('group_ids')->nullable();
            $table->text('role_ids')->nullable();
            $table->string('employee_id')->nullable();
            $table->integer('designation_id')->nullable();
            $table->integer('logistic_id')->nullable();
            $table->integer('branch_id')->nullable();
            $table->integer('department_id')->nullable();
            $table->string('registration_type')->nullable();
            $table->string('user_type', 64)->default('SERVICE_RECIPIENT')->comment('SERVICE_PROVIDER, SERVICE_RECIPIENT');
            $table->string('institute_organization_type')->nullable();
            $table->integer('institute_organization_id')->nullable();
            $table->integer('manager_id')->nullable();
            $table->string('name')->nullable();
            $table->string('first_name');
            $table->string('last_name')->nullable();
            $table->string('company_name')->nullable();
            $table->string('email')->index()->unique()->nullable();
            $table->dateTime('email_verified_at')->nullable();
            $table->string('phone', 100)->unique()->nullable();
            $table->dateTime('phone_verified_at')->nullable();
            $table->string('password');
            $table->tinyInteger('force_password_change')->nullable()->comment('1=>Yes');
            $table->tinyInteger('session_timeout')->nullable()->comment('1 Hours');
            $table->tinyInteger('session_timeout_never')->nullable()->comment('1=>Yes');
            $table->string('timezone', 30)->default('UTC')->nullable();
            $table->string('locale', 15)->default('en')->nullable();
            $table->string('profile_image')->nullable();
            $table->bigInteger('device_id')->nullable();
            $table->tinyInteger('web_access')->nullable();
            $table->tinyInteger('app_access')->nullable();
            $table->unsignedInteger('is_verified')->default(0);
            $table->unsignedInteger('requests_count')->default(0);
            $table->rememberToken();
            $table->string('logged_in_ip', 100)->nullable();
            $table->dateTime('logged_in_at')->nullable();
            $table->string('created_ip', 100)->nullable();
            $table->integer('created_by')->nullable();
            $table->integer('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
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
        Schema::dropIfExists('users');
    }
}
