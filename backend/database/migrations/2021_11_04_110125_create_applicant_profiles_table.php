<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateApplicantprofilesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('applicant_profiles', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->integer('organization_id')->nullable();
            $table->tinyInteger('organogram_id')->nullable()->index();
            $table->integer('user_id')->index();
            $table->tinyInteger('registration_type')->nullable();

            $table->string('name_en')->nullable();
            $table->string('name_bn')->nullable();
            $table->string('fathers_name_en')->nullable();
            $table->string('fathers_name_bn')->nullable();
            $table->string('mothers_name_en')->nullable();
            $table->string('mothers_name_bn')->nullable();
            $table->date('dob')->nullable();
            $table->integer('home_district_id')->nullable();
            $table->string('gender', 64)->nullable();
            $table->string('nationality', 64)->nullable();
            $table->string('nid', 64)->nullable();
            $table->string('email', 64)->nullable();
            $table->string('mobile_no', 64)->nullable();
            $table->string('skype', 64)->nullable();
            $table->string('photo')->nullable();
            $table->string('present_house_road_no')->nullable();
            $table->string('present_village')->nullable();
            $table->string('present_post_office')->nullable();
            $table->integer('present_division_id')->nullable();
            $table->integer('present_district_id')->nullable();
            $table->integer('present_upazila_id')->nullable();
            $table->tinyInteger('is_present_permanent_address_same')->default(0)->nullable();
            $table->string('permanent_house_road_no')->nullable();
            $table->string('permanent_village')->nullable();
            $table->string('permanent_post_office')->nullable();
            $table->integer('permanent_division_id')->nullable();
            $table->integer('permanent_district_id')->nullable();
            $table->integer('permanent_upazila_id')->nullable();


            $table->string('institute_organization_type', 64)->nullable();
            $table->integer('organization_category')->nullable();
            $table->integer('business_service_sector')->nullable();
            $table->string('governance_type')->nullable();
            $table->integer('institute_organization_id')->nullable();
            $table->string('institute_organization_other')->nullable();
            $table->string('origin')->nullable();
            $table->integer('country_of_origin')->nullable();
            $table->string('institute_organization_address')->nullable();
            $table->string('institute_organization_post_office')->nullable();
            $table->integer('institute_organization_division')->nullable();
            $table->integer('institute_organization_district')->nullable();
            $table->integer('institute_organization_upazila')->nullable();
            $table->string('institute_organization_website')->nullable();
            $table->string('institute_organization_email')->nullable();
            $table->string('institute_organization_mobile')->nullable();
            $table->string('institute_organization_phone')->nullable();
            $table->integer('onwership_type')->nullable();
            $table->string('onwership_type_other')->nullable();
            $table->string('onwership_type_name')->nullable();
            $table->string('onwership_type_mobile')->nullable();
            $table->string('onwership_type_email')->nullable();
            $table->string('onwership_type_signature')->nullable();
            $table->string('onwership_type_seal')->nullable();
            $table->string('trade_license_number')->nullable();
            $table->string('bin')->nullable();
            $table->string('contact_persion_name_en')->nullable();
            $table->string('contact_persion_name_bn')->nullable();
            $table->integer('contact_persion_designation_id')->nullable();
            $table->string('contact_persion_nid')->nullable();
            $table->string('contact_persion_mobile')->nullable();
            $table->string('contact_persion_email')->nullable();
            $table->string('contact_persion_image')->nullable();

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
        Schema::dropIfExists('applicant_profiles');
    }
}
