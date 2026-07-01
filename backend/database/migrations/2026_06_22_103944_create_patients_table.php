<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePatientsTable extends Migration
{
    public function up()
    {
        Schema::create('patients', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique()->index();
            $table->unsignedBigInteger('organogram_id')->nullable();
            $table->integer('mrn')->unique()->index();

            // Personal Info
            $table->string('title', 10)->nullable();
            $table->string('first_name', 100);
            $table->string('middle_name', 100)->nullable();
            $table->string('last_name', 100);
            // $table->string('full_name')->virtualAs('CONCAT_WS(" ", first_name, middle_name, last_name)');

            // Demographics
            $table->date('date_of_birth');
            $table->enum('gender', ['male', 'female', 'other', 'unknown'])->default('unknown');
            $table->string('blood_group', 5)->nullable();
            $table->enum('marital_status', ['single', 'married', 'divorced', 'widowed', 'separated', 'other'])->nullable();
            $table->enum('religion', ['hindu', 'muslim', 'christian', 'sikh', 'buddhist', 'jain', 'other', 'none'])->nullable();
            $table->string('nationality', 100)->nullable();
            $table->string('occupation', 100)->nullable();

            // Contact
            $table->string('email', 100)->nullable()->unique();
            $table->string('primary_phone', 20)->unique();
            $table->string('secondary_phone', 20)->nullable();
            $table->string('emergency_contact_name', 100)->nullable();
            $table->string('emergency_contact_phone', 20)->nullable();
            $table->string('emergency_contact_relation', 50)->nullable();

            // Current Address
            $table->text('current_address')->nullable();
            $table->string('current_city', 50)->nullable();
            $table->string('current_state', 50)->nullable();
            $table->string('current_country', 50)->nullable();
            $table->string('current_pincode', 10)->nullable();

            // Permanent Address
            $table->text('permanent_address')->nullable();
            $table->string('permanent_city', 50)->nullable();
            $table->string('permanent_state', 50)->nullable();
            $table->string('permanent_country', 50)->nullable();
            $table->string('permanent_pincode', 10)->nullable();

            // ID Documents
            $table->string('pan_number', 14)->nullable()->unique();
            $table->string('voter_id', 20)->nullable()->unique();
            $table->string('driving_license', 20)->nullable()->unique();
            $table->string('passport_number', 20)->nullable()->unique();

            // Medical History
            $table->text('known_allergies')->nullable();
            $table->text('chronic_diseases')->nullable();
            $table->text('current_medications')->nullable();
            $table->text('surgical_history')->nullable();
            $table->text('family_medical_history')->nullable();
            $table->text('social_history')->nullable();

            // Insurance
            $table->string('insurance_provider', 100)->nullable();
            $table->string('insurance_policy_number', 50)->nullable();
            $table->date('insurance_valid_from')->nullable();
            $table->date('insurance_valid_to')->nullable();
            $table->string('insurance_group_number', 50)->nullable();
            $table->string('insurance_phone', 20)->nullable();

            // Flags
            $table->boolean('is_sensitive')->default(false);
            $table->boolean('is_vip')->default(false);
            $table->boolean('consent_signed')->default(false);
            $table->timestamp('consent_signed_at')->nullable();
            $table->text('special_notes')->nullable();

            // Audit & Tracking
            $table->timestamp('registration_date')->useCurrent();
            $table->timestamp('last_visit_date')->nullable();
            $table->integer('total_visits')->default(0);
            $table->foreignId('registered_by')->nullable()->constrained('users')->nullOnDelete();

            // Standard columns
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->integer('sort_order')->default(0);
            $table->tinyInteger('status')->default(1);
            $table->softDeletes();
            $table->timestamps();

            // Indexes
            $table->index(['first_name', 'last_name']);
            $table->index(['date_of_birth', 'gender']);
            $table->index(['status', 'deleted_at']);
            $table->index(['current_city', 'current_state']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('patients');
    }
}
