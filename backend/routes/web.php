<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It is a breeze. Simply tell Lumen the URIs it should respond to
| and give it the Closure to call when that URI is requested.
| This is test
|
*/

Route::get('/', function () {
    return 'app-version-' . app()->version();
});

Route::prefix('api')->group(function () {

    Route::group(['prefix' => 'oauth', 'middleware' => ['restrictIp']], function () {

        # Load Auth State
        Route::post('/load-auth-state', [App\Http\Controllers\VerifyAccessTokenController::class, 'loadAuthState']);
        # Scopes
        Route::post('/load-user-scopes', [App\Http\Controllers\AuthController::class, 'loadUserScopes']);
        # Check Valid Login Info
        Route::post('/check-valid-login-info', [App\Http\Controllers\AuthController::class, 'checkValidLoginInfo']);
        # Switch Organization
        Route::post('/switch-login-organization', [App\Http\Controllers\AuthController::class, 'switchLoginOrganization']);
        # Login
        Route::post('/login', [App\Http\Controllers\AuthController::class, 'login']);
        # Id Token
        Route::post('/validate-id-token-and-generate-access-token', [App\Http\Controllers\AuthController::class, 'validateIdTokenAndGenerateAccessToken']);
        # Registration
        Route::post('/register', [App\Http\Controllers\AuthController::class, 'register']);
        Route::post('/verify-email', [App\Http\Controllers\AuthController::class, 'verifyUserEmail']);
        Route::post('/verify-phone', [App\Http\Controllers\AuthController::class, 'verifyUserPhone']);
        # Forgot Password
        Route::post('/forgot-password', [App\Http\Controllers\AuthController::class, 'forgotPassword']);
        Route::post('/reset-password', [App\Http\Controllers\AuthController::class, 'resetPassword']);
        # Change Password
        Route::post('/change-password', [App\Http\Controllers\AuthController::class, 'changePassword']);
        # Logout
        Route::post('/logout', [App\Http\Controllers\AuthController::class, 'logout']);
        # Token Refresh
        Route::post('/token/refresh', [App\Http\Controllers\AuthController::class, 'refreshToken']);
        # Invite People
        Route::post('/invite-people', [App\Http\Controllers\AuthController::class, 'invitePeople']);
        # send OTP email
        Route::post('/send-otp', [App\Http\Controllers\AuthController::class, 'OtpCode']);
        # password pattern
        Route::get('/password-pattern', [App\Http\Controllers\AuthController::class, 'passwordPattern']);

        // FOR DASHBOARD
        Route::get('/dashboard-stats', [App\Http\Controllers\DashboardController::class, 'getDashboardStats']);
    });

    Route::group(['prefix' => 'example', 'middleware' => ['restrictIp', 'authVerify']], function () {
        // Bulk Actions
        Route::post('/bulk', [App\Http\Controllers\ExampleController::class, 'bulk']);

        // Drop Down List
        Route::get('/dropdown', [App\Http\Controllers\ExampleController::class, 'dropdown']);

        // Get All
        Route::get('/', [App\Http\Controllers\ExampleController::class, 'index']);

        // Get One
        Route::get('/{id}', [App\Http\Controllers\ExampleController::class, 'show']);

        // Create
        Route::post('/', [App\Http\Controllers\ExampleController::class, 'store']);

        // Update (Check Validation)
        Route::put('/{id}', [App\Http\Controllers\ExampleController::class, 'update']);

        // Update Partial (Without Validation)
        Route::patch('/{id}', [App\Http\Controllers\ExampleController::class, 'updateFields']);

        // Delete
        Route::delete('/{id}', [App\Http\Controllers\ExampleController::class, 'destroy']);
    });

    Route::group(['prefix' => 'group', 'middleware' => ['restrictIp', 'authVerify']], function () {
        // Drop Down List
        Route::get('/dropdown', [App\Http\Controllers\GroupController::class, 'dropdown']);

        // Get All
        Route::get('/', [App\Http\Controllers\GroupController::class, 'index']);

        // Get One
        Route::get('/{id}', [App\Http\Controllers\GroupController::class, 'show']);

        // Create
        Route::post('/', [App\Http\Controllers\GroupController::class, 'store']);

        // Update (Check Validation)
        Route::put('/{id}', [App\Http\Controllers\GroupController::class, 'update']);

        // Update Partial (Without Validation)
        Route::patch('/{id}', [App\Http\Controllers\GroupController::class, 'updateFields']);

        // Delete
        Route::delete('/{id}', [App\Http\Controllers\GroupController::class, 'destroy']);
    });

    Route::group(['prefix' => 'role', 'middleware' => ['restrictIp', 'authVerify']], function () {
        // Drop Down List
        Route::get('/dropdown', [App\Http\Controllers\RoleController::class, 'dropdown']);
        Route::post('/duplicate-role-with-permission', [App\Http\Controllers\RoleController::class, 'duplicateRoleWithPermission']);
        // Get All
        Route::get('/', [App\Http\Controllers\RoleController::class, 'index']);

        // Get One
        Route::get('/{id}', [App\Http\Controllers\RoleController::class, 'show']);

        // Create
        Route::post('/', [App\Http\Controllers\RoleController::class, 'store']);

        // Update (Check Validation)
        Route::put('/{id}', [App\Http\Controllers\RoleController::class, 'update']);

        // Update Partial (Without Validation)
        Route::patch('/{id}', [App\Http\Controllers\RoleController::class, 'updateFields']);

        // Delete
        Route::delete('/{id}', [App\Http\Controllers\RoleController::class, 'destroy']);
    });

    Route::group(['prefix' => 'user', 'middleware' => ['restrictIp', 'authVerify']], function () {
        // Bulk Actions
        Route::post('/bulk', [App\Http\Controllers\UserController::class, 'bulk']);

        // Drop Down List
        Route::get('/dropdown', [App\Http\Controllers\UserController::class, 'dropdown']);

        // Create
        Route::post('/update-user-setting', [App\Http\Controllers\UserController::class, 'updateUserSetting']);

        // Get All
        Route::get('/', [App\Http\Controllers\UserController::class, 'index']);

        // Get One
        Route::get('/{id}', [App\Http\Controllers\UserController::class, 'show']);

        // Create
        Route::post('/', [App\Http\Controllers\UserController::class, 'store']);

        // Update (Check Validation)
        Route::put('/{id}', [App\Http\Controllers\UserController::class, 'update']);

        // Update Partial (Without Validation)
        Route::patch('/{id}', [App\Http\Controllers\UserController::class, 'updateFields']);

        // Delete
        Route::delete('/{id}', [App\Http\Controllers\UserController::class, 'destroy']);
    });

    Route::group(['prefix' => 'resource', 'middleware' => ['restrictIp', 'authVerify']], function () {
        // Drop Down List
        Route::get('/dropdown', [App\Http\Controllers\ResourceController::class, 'dropdown']);

        // Get All
        Route::get('/', [App\Http\Controllers\ResourceController::class, 'index']);

        // Get One
        Route::get('/{id}', [App\Http\Controllers\ResourceController::class, 'show']);

        // Create
        Route::post('/', [App\Http\Controllers\ResourceController::class, 'store']);

        // Update (Check Validation)
        Route::put('/{id}', [App\Http\Controllers\ResourceController::class, 'update']);

        // Update Partial (Without Validation)
        Route::patch('/{id}', [App\Http\Controllers\ResourceController::class, 'updateFields']);

        // Delete
        Route::delete('/{id}', [App\Http\Controllers\ResourceController::class, 'destroy']);
    });

    Route::group(['prefix' => 'scope', 'middleware' => ['restrictIp', 'authVerify']], function () {
        // Drop Down List
        Route::get('/dropdown', [App\Http\Controllers\ScopeController::class, 'dropdown']);

        // Get All
        Route::get('/', [App\Http\Controllers\ScopeController::class, 'index']);

        // Get One
        Route::get('/{id}', [App\Http\Controllers\ScopeController::class, 'show']);

        // Create
        Route::post('/', [App\Http\Controllers\ScopeController::class, 'store']);

        // Update (Check Validation)
        Route::put('/{id}', [App\Http\Controllers\ScopeController::class, 'update']);

        // Update Partial (Without Validation)
        Route::patch('/{id}', [App\Http\Controllers\ScopeController::class, 'updateFields']);

        // Delete
        Route::delete('/{id}', [App\Http\Controllers\ScopeController::class, 'destroy']);
    });

    Route::group(['prefix' => 'permission', 'middleware' => ['restrictIp', 'authVerify']], function () {

        Route::post('/check-resource-permission', [App\Http\Controllers\PermissionController::class, 'checkResourcePermission']);

        Route::post('/save-permission', [App\Http\Controllers\PermissionController::class, 'savePermission']);

        Route::post('/role-permission/{roleId}', [App\Http\Controllers\PermissionController::class, 'rolePermission']);

        Route::post('/user-permission/{userId}', [App\Http\Controllers\PermissionController::class, 'userPermission']);

        // Drop Down List
        Route::get('/dropdown', [App\Http\Controllers\PermissionController::class, 'dropdown']);

        // Get All
        Route::get('/', [App\Http\Controllers\PermissionController::class, 'index']);

        // Get One
        Route::get('/{id}', [App\Http\Controllers\PermissionController::class, 'show']);

        // Create
        Route::post('/', [App\Http\Controllers\PermissionController::class, 'store']);

        // Update (Check Validation)
        Route::put('/{id}', [App\Http\Controllers\PermissionController::class, 'update']);

        // Update Partial (Without Validation)
        Route::patch('/{id}', [App\Http\Controllers\PermissionController::class, 'updateFields']);

        // Delete
        Route::delete('/{id}', [App\Http\Controllers\PermissionController::class, 'destroy']);
    });

    Route::group(['prefix' => 'apps-module', 'middleware' => ['restrictIp', 'authVerify']], function () {
        // Drop Down List
        Route::get('/dropdown', [App\Http\Controllers\AppsModuleController::class, 'dropdown']);

        // Get All
        Route::get('/', [App\Http\Controllers\AppsModuleController::class, 'index']);

        // Get One
        Route::get('/{id}', [App\Http\Controllers\AppsModuleController::class, 'show']);

        // Create
        Route::post('/', [App\Http\Controllers\AppsModuleController::class, 'store']);

        // Update (Check Validation)
        Route::put('/{id}', [App\Http\Controllers\AppsModuleController::class, 'update']);

        // Update Partial (Without Validation)
        Route::patch('/{id}', [App\Http\Controllers\AppsModuleController::class, 'updateFields']);

        // Delete
        Route::delete('/{id}', [App\Http\Controllers\AppsModuleController::class, 'destroy']);
    });

    Route::group(['prefix' => 'workspace', 'middleware' => ['restrictIp', 'authVerify']], function () {
        // Drop Down List
        Route::get('/dropdown', [App\Http\Controllers\WorkspaceController::class, 'dropdown']);

        // Get All
        Route::get('/', [App\Http\Controllers\WorkspaceController::class, 'index']);

        // Get One
        Route::get('/{id}', [App\Http\Controllers\WorkspaceController::class, 'show']);

        // Create
        Route::post('/', [App\Http\Controllers\WorkspaceController::class, 'store']);

        // Update (Check Validation)
        Route::put('/{id}', [App\Http\Controllers\WorkspaceController::class, 'update']);

        // Update Partial (Without Validation)
        Route::patch('/{id}', [App\Http\Controllers\WorkspaceController::class, 'updateFields']);

        // Delete
        Route::delete('/{id}', [App\Http\Controllers\WorkspaceController::class, 'destroy']);
    });

    Route::group(['prefix' => 'organization', 'middleware' => ['restrictIp', 'authVerify']], function () {
        // Drop Down List
        Route::get('/dropdown', [App\Http\Controllers\OrganizationController::class, 'dropdown']);
        //
        Route::get('/getOrganizationTree', [App\Http\Controllers\OrganizationController::class, 'getOrganizationTree']);

        Route::post('/organization-child-ids', [App\Http\Controllers\OrganizationController::class, 'getOrganizationChildIds']);
        // Get All
        Route::get('/', [App\Http\Controllers\OrganizationController::class, 'index']);
        // Get One
        Route::get('/{id}', [App\Http\Controllers\OrganizationController::class, 'show']);
        // Create
        Route::post('/', [App\Http\Controllers\OrganizationController::class, 'store']);
        // Update (Check Validation)
        Route::put('/{id}', [App\Http\Controllers\OrganizationController::class, 'update']);
        // Update Partial (Without Validation)
        Route::patch('/{id}', [App\Http\Controllers\OrganizationController::class, 'updateFields']);
        // Delete
        Route::delete('/{id}', [App\Http\Controllers\OrganizationController::class, 'destroy']);
    });

    Route::group(['prefix' => 'organogram', 'middleware' => ['restrictIp', 'authVerify']], function () {
        // Drop Down List
        Route::get('/dropdown', [App\Http\Controllers\OrganogramController::class, 'dropdown']);

        // Route::get('/syncDoptarOrganogram', [App\Http\Controllers\OrganogramController::class, 'syncDoptarOrganogram']);

        Route::get('/getOrganogramTree', [App\Http\Controllers\OrganogramController::class, 'getOrganogramTree']);

        // Route::get('/getLabTree', [App\Http\Controllers\OrganogramController::class, 'getLabTree']);

        // Route::post('/organogram-child-ids', [App\Http\Controllers\OrganogramController::class, 'getOrganogramChildIds']);

        // Get All
        Route::get('/', [App\Http\Controllers\OrganogramController::class, 'index']);

        // Get One
        Route::get('/{id}', [App\Http\Controllers\OrganogramController::class, 'show']);

        // Create
        Route::post('/', [App\Http\Controllers\OrganogramController::class, 'store']);

        // Update (Check Validation)
        Route::put('/{id}', [App\Http\Controllers\OrganogramController::class, 'update']);

        // Update Partial (Without Validation)
        Route::patch('/{id}', [App\Http\Controllers\OrganogramController::class, 'updateFields']);

        // Delete
        Route::delete('/{id}', [App\Http\Controllers\OrganogramController::class, 'destroy']);
    });

    Route::group(['prefix' => 'request-access', 'middleware' => ['restrictIp', 'authVerify']], function () {
        // Drop Down List
        Route::get('/dropdown', [App\Http\Controllers\RequestAccessController::class, 'dropdown']);

        // Get All
        Route::get('/', [App\Http\Controllers\RequestAccessController::class, 'index']);

        // Get One
        Route::get('/{id}', [App\Http\Controllers\RequestAccessController::class, 'show']);

        // Create
        Route::post('/', [App\Http\Controllers\RequestAccessController::class, 'store']);

        // Update (Check Validation)
        Route::put('/{id}', [App\Http\Controllers\RequestAccessController::class, 'update']);

        // Update Partial (Without Validation)
        Route::patch('/{id}', [App\Http\Controllers\RequestAccessController::class, 'updateFields']);

        // Delete
        Route::delete('/{id}', [App\Http\Controllers\RequestAccessController::class, 'destroy']);
    });

    Route::group(['prefix' => 'employee', 'middleware' => ['restrictIp', 'authVerify']], function () {
        // Get By user Id
        Route::get('/getByUserId/{id}', [App\Http\Controllers\EmployeeController::class, 'getByUserId']);
        // Drop Down List
        Route::get('/dropdown', [App\Http\Controllers\EmployeeController::class, 'dropdown']);
        // Get All
        Route::get('/', [App\Http\Controllers\EmployeeController::class, 'index']);
        // Get One
        Route::get('/{id}', [App\Http\Controllers\EmployeeController::class, 'show']);
        // Create
        Route::post('/', [App\Http\Controllers\EmployeeController::class, 'store']);
        // Update (Check Validation)
        Route::put('/{id}', [App\Http\Controllers\EmployeeController::class, 'update']);
        // Update Partial (Without Validation)
        Route::patch('/{id}', [App\Http\Controllers\EmployeeController::class, 'updateFields']);
        // Delete
        Route::delete('/{id}', [App\Http\Controllers\EmployeeController::class, 'destroy']);
        // Get Employee List by Designation id
        Route::post('/getEmployeeListByDesignationIds', [App\Http\Controllers\EmployeeController::class, 'getEmployeeListByDesignationIds']);
    });

    // APPLICANT PROFILE
    Route::group(['prefix' => 'applicant-profile', 'middleware' => ['restrictIp', 'authVerify']], function () {
        // Drop Down List
        Route::get('/dropdown', [App\Http\Controllers\ApplicantProfileController::class, 'dropdown']);
        // Git By Where
        Route::get('/getByWhere', [App\Http\Controllers\ApplicantProfileController::class, 'getByWhere']);
        //profile details
        Route::get('/applicant/details/{id}', [App\Http\Controllers\ApplicantProfileController::class, 'profileDetails']);
        // Get All
        Route::get('/', [App\Http\Controllers\ApplicantProfileController::class, 'index']);
        // Get One
        Route::get('/{id}', [App\Http\Controllers\ApplicantProfileController::class, 'show']);
        // Create
        Route::post('/', [App\Http\Controllers\ApplicantProfileController::class, 'store']);
        // Update (Check Validation)
        Route::put('/{id}', [App\Http\Controllers\ApplicantProfileController::class, 'update']);
        // Update Partial (Without Validation)
        Route::patch('/{id}', [App\Http\Controllers\ApplicantProfileController::class, 'updateFields']);
        // Delete
        Route::delete('/{id}', [App\Http\Controllers\ApplicantProfileController::class, 'destroy']);
    });

    Route::group(['prefix' => 'option', 'middleware' => ['restrictIp', 'authVerify']], function () {
        // Load
        Route::get('/load', [App\Http\Controllers\OptionController::class, 'load']); // Done

        // Save
        Route::post('/save', [App\Http\Controllers\OptionController::class, 'save']); // Done
    });

    Route::group(['prefix' => 'session-service', 'middleware' => ['restrictIp', 'authVerify']], function () {
        Route::post('/get-session-data', [App\Http\Controllers\SessionController::class, 'getSessionServiceData']);
    });

    Route::group(['prefix' => 'artisan', 'middleware' => ['restrictIp', 'authVerify']], function () {
        Route::get('/flush-all-cache', [App\Http\Controllers\ArtisanCommandController::class, 'flushAllCache']);
        Route::post('/scheduler/run', [App\Http\Controllers\ArtisanCommandController::class, 'schedule']);
    });

    Route::group(['prefix' => 'file'], function () {
        // File Upload
        Route::post('/upload', [App\Http\Controllers\FileController::class, 'upload']);

        Route::post('/get-multiple-files', [App\Http\Controllers\FileController::class, 'getMultipleFiles']);

        // File download
        Route::get('/download/{fileId}', [App\Http\Controllers\FileController::class, 'download']);

        // File download
        Route::get('/download-file', [App\Http\Controllers\FileController::class, 'downloadFile']);

        // Get File
        Route::get('/{id}', [App\Http\Controllers\FileController::class, 'show']); // Done

        // Delete File
        Route::delete('/{id}', [App\Http\Controllers\FileController::class, 'destroy']); // Done
    });

    // BACK_OFFICE_SETUP: START
    Route::group(['prefix' => 'enum', 'middleware' => ['restrictIp', 'authVerify']], function () {
        // Drop Down List
        Route::get('/dropdown', [App\Http\Controllers\EnumController::class, 'dropdown']);

        // Get All
        Route::get('/', [App\Http\Controllers\EnumController::class, 'index']);

        // Get One
        Route::get('/{id}', [App\Http\Controllers\EnumController::class, 'show']);
    });

    Route::group(['prefix' => 'application-settings', 'middleware' => ['restrictIp', 'authVerify']], function () {
        // Drop Down List
        Route::get('/dropdown', [App\Http\Controllers\ApplicationSettingController::class, 'dropdown']);

        // Create
        Route::post('/', [App\Http\Controllers\ApplicationSettingController::class, 'store']);

        // Get One
        Route::get('/{id}', [App\Http\Controllers\ApplicationSettingController::class, 'show']);
    });

    Route::group(['prefix' => 'unit', 'middleware' => ['restrictIp', 'authVerify']], function () {
        // Drop Down List
        Route::get('/dropdown', [App\Http\Controllers\UnitController::class, 'dropdown']);

        // Get All
        Route::get('/', [App\Http\Controllers\UnitController::class, 'index']);

        // Get One
        Route::get('/{id}', [App\Http\Controllers\UnitController::class, 'show']);

        // Create
        Route::post('/', [App\Http\Controllers\UnitController::class, 'store']);

        // Update (Check Validation)
        Route::put('/{id}', [App\Http\Controllers\UnitController::class, 'update']);

        // Update Partial (Without Validation)
        Route::patch('/{id}', [App\Http\Controllers\UnitController::class, 'updateFields']);

        // Delete
        Route::delete('/{id}', [App\Http\Controllers\UnitController::class, 'destroy']);
    });

    Route::group(['prefix' => 'department', 'middleware' => ['restrictIp', 'authVerify']], function () {
        // Drop Down List
        Route::get('/dropdown', [App\Http\Controllers\DepartmentController::class, 'dropdown']);

        // Get All
        Route::get('/', [App\Http\Controllers\DepartmentController::class, 'index']);

        // Get One
        Route::get('/{id}', [App\Http\Controllers\DepartmentController::class, 'show']);

        // Create
        Route::post('/', [App\Http\Controllers\DepartmentController::class, 'store']);

        // Update (Check Validation)
        Route::put('/{id}', [App\Http\Controllers\DepartmentController::class, 'update']);

        // Update Partial (Without Validation)
        Route::patch('/{id}', [App\Http\Controllers\DepartmentController::class, 'updateFields']);

        // Delete
        Route::delete('/{id}', [App\Http\Controllers\DepartmentController::class, 'destroy']);
    });

    Route::group(['prefix' => 'designation', 'middleware' => ['restrictIp', 'authVerify']], function () {
        // Drop Down List
        Route::get('/dropdown', [App\Http\Controllers\DesignationController::class, 'dropdown']);

        // Get All
        Route::get('/', [App\Http\Controllers\DesignationController::class, 'index']);

        // Get One
        Route::get('/{id}', [App\Http\Controllers\DesignationController::class, 'show']);

        // Create
        Route::post('/', [App\Http\Controllers\DesignationController::class, 'store']);

        // Update (Check Validation)
        Route::put('/{id}', [App\Http\Controllers\DesignationController::class, 'update']);

        // Update Partial (Without Validation)
        Route::patch('/{id}', [App\Http\Controllers\DesignationController::class, 'updateFields']);

        // Delete
        Route::delete('/{id}', [App\Http\Controllers\DesignationController::class, 'destroy']);
    });

    Route::group(['prefix' => 'requisition-item-limit', 'middleware' => ['restrictIp', 'authVerify']], function () {
        Route::post('/bulk', [App\Http\Controllers\RequisitionItemLimitController::class, 'bulk']);
        Route::get('/dropdown', [App\Http\Controllers\RequisitionItemLimitController::class, 'dropdown']);
        Route::get('/', [App\Http\Controllers\RequisitionItemLimitController::class, 'index']);
        Route::get('/{id}', [App\Http\Controllers\RequisitionItemLimitController::class, 'show']);
        Route::post('/', [App\Http\Controllers\RequisitionItemLimitController::class, 'store']);
        Route::put('/{id}', [App\Http\Controllers\RequisitionItemLimitController::class, 'update']);
        Route::patch('/{id}', [App\Http\Controllers\RequisitionItemLimitController::class, 'updateFields']);
        Route::delete('/{id}', [App\Http\Controllers\RequisitionItemLimitController::class, 'destroy']);
    });

    Route::group(['prefix' => 'item-category', 'middleware' => ['restrictIp', 'authVerify']], function () {
        // Drop Down List
        Route::get('/dropdown', [App\Http\Controllers\ItemCategoryController::class, 'dropdown']);

        // Get All
        Route::get('/', [App\Http\Controllers\ItemCategoryController::class, 'index']);

        // Get One
        Route::get('/{id}', [App\Http\Controllers\ItemCategoryController::class, 'show']);

        // Create
        Route::post('/', [App\Http\Controllers\ItemCategoryController::class, 'store']);

        // Update (Check Validation)
        Route::put('/{id}', [App\Http\Controllers\ItemCategoryController::class, 'update']);

        // Update Partial (Without Validation)
        Route::patch('/{id}', [App\Http\Controllers\ItemCategoryController::class, 'updateFields']);

        // Delete
        Route::delete('/{id}', [App\Http\Controllers\ItemCategoryController::class, 'destroy']);
    });

    Route::group(['prefix' => 'brand', 'middleware' => ['restrictIp', 'authVerify']], function () {
        // Drop Down List
        Route::get('/dropdown', [App\Http\Controllers\BrandController::class, 'dropdown']);

        // Get All
        Route::get('/', [App\Http\Controllers\BrandController::class, 'index']);

        // Get One
        Route::get('/{id}', [App\Http\Controllers\BrandController::class, 'show']);

        // Create
        Route::post('/', [App\Http\Controllers\BrandController::class, 'store']);

        // Update (Check Validation)
        Route::put('/{id}', [App\Http\Controllers\BrandController::class, 'update']);

        // Update Partial (Without Validation)
        Route::patch('/{id}', [App\Http\Controllers\BrandController::class, 'updateFields']);

        // Delete
        Route::delete('/{id}', [App\Http\Controllers\BrandController::class, 'destroy']);
    });

    Route::group(['prefix' => 'approver-group', 'middleware' => ['restrictIp', 'authVerify']], function () {
        // Bulk Actions
        Route::get('/test', [App\Http\Controllers\ApproverGroupController::class, 'test']);
        Route::post('/bulk', [App\Http\Controllers\ApproverGroupController::class, 'bulk']);

        // Drop Down List
        Route::get('/dropdown', [App\Http\Controllers\ApproverGroupController::class, 'dropdown']);
        Route::get('/member-dropdown', [App\Http\Controllers\ApproverGroupController::class, 'memberDropdown']);

        // Get All
        Route::get('/', [App\Http\Controllers\ApproverGroupController::class, 'index']);

        // Get One
        Route::get('/{id}', [App\Http\Controllers\ApproverGroupController::class, 'show']);

        // Create
        Route::post('/', [App\Http\Controllers\ApproverGroupController::class, 'store']);

        // Update (Check Validation)
        Route::put('/{id}', [App\Http\Controllers\ApproverGroupController::class, 'update']);

        // Update Partial (Without Validation)
        Route::patch('/{id}', [App\Http\Controllers\ApproverGroupController::class, 'updateFields']);

        // Delete
        Route::delete('/{id}', [App\Http\Controllers\ApproverGroupController::class, 'destroy']);
    });

    Route::group(['prefix' => 'branch', 'middleware' => ['restrictIp', 'authVerify']], function () {
        // Bulk Actions
        Route::get('/test', [App\Http\Controllers\BranchController::class, 'test']);
        Route::post('/bulk', [App\Http\Controllers\BranchController::class, 'bulk']);
        Route::get('/getBranchTree', [App\Http\Controllers\BranchController::class, 'getBranchTree']);

        // Drop Down List
        Route::get('/dropdown', [App\Http\Controllers\BranchController::class, 'dropdown']);

        // Get All
        Route::get('/', [App\Http\Controllers\BranchController::class, 'index']);

        // Get One
        Route::get('/{id}', [App\Http\Controllers\BranchController::class, 'show']);

        // Create
        Route::post('/', [App\Http\Controllers\BranchController::class, 'store']);

        // Update (Check Validation)
        Route::put('/{id}', [App\Http\Controllers\BranchController::class, 'update']);

        // Update Partial (Without Validation)
        Route::patch('/{id}', [App\Http\Controllers\BranchController::class, 'updateFields']);

        // Delete
        Route::delete('/{id}', [App\Http\Controllers\BranchController::class, 'destroy']);
    });

    Route::group(['prefix' => 'shelve', 'middleware' => ['restrictIp', 'authVerify']], function () {
        // Bulk Actions
        Route::get('/test', [App\Http\Controllers\ShelveController::class, 'test']);
        Route::post('/bulk', [App\Http\Controllers\ShelveController::class, 'bulk']);

        // Drop Down List
        Route::get('/dropdown', [App\Http\Controllers\ShelveController::class, 'dropdown']);

        // Get All
        Route::get('/', [App\Http\Controllers\ShelveController::class, 'index']);

        // Get One
        Route::get('/{id}', [App\Http\Controllers\ShelveController::class, 'show']);

        // Create
        Route::post('/', [App\Http\Controllers\ShelveController::class, 'store']);

        // Update (Check Validation)
        Route::put('/{id}', [App\Http\Controllers\ShelveController::class, 'update']);

        // Update Partial (Without Validation)
        Route::patch('/{id}', [App\Http\Controllers\ShelveController::class, 'updateFields']);

        // Delete
        Route::delete('/{id}', [App\Http\Controllers\ShelveController::class, 'destroy']);
    });

    Route::group(['prefix' => 'logistic', 'middleware' => ['restrictIp', 'authVerify']], function () {
        // Bulk Actions
        Route::get('/test', [App\Http\Controllers\LogisticController::class, 'test']);
        Route::post('/bulk', [App\Http\Controllers\LogisticController::class, 'bulk']);

        // Drop Down List
        Route::get('/dropdown', [App\Http\Controllers\LogisticController::class, 'dropdown']);

        // Get All
        Route::get('/', [App\Http\Controllers\LogisticController::class, 'index']);

        // Get One
        Route::get('/{id}', [App\Http\Controllers\LogisticController::class, 'show']);

        // Create
        Route::post('/', [App\Http\Controllers\LogisticController::class, 'store']);

        // Update (Check Validation)
        Route::put('/{id}', [App\Http\Controllers\LogisticController::class, 'update']);

        // Update Partial (Without Validation)
        Route::patch('/{id}', [App\Http\Controllers\LogisticController::class, 'updateFields']);

        // Delete
        Route::delete('/{id}', [App\Http\Controllers\LogisticController::class, 'destroy']);
    });

    Route::group(['prefix' => 'attribute', 'middleware' => ['restrictIp', 'authVerify']], function () {
        // Bulk Actions
        Route::get('/test', [App\Http\Controllers\AttributeController::class, 'test']);
        Route::post('/bulk', [App\Http\Controllers\AttributeController::class, 'bulk']);

        // Drop Down List
        Route::get('/dropdown', [App\Http\Controllers\AttributeController::class, 'dropdown']);

        // Get All
        Route::get('/', [App\Http\Controllers\AttributeController::class, 'index']);

        // Get One
        Route::get('/{id}', [App\Http\Controllers\AttributeController::class, 'show']);

        // Create
        Route::post('/', [App\Http\Controllers\AttributeController::class, 'store']);

        // Update (Check Validation)
        Route::put('/{id}', [App\Http\Controllers\AttributeController::class, 'update']);

        // Update Partial (Without Validation)
        Route::patch('/{id}', [App\Http\Controllers\AttributeController::class, 'updateFields']);

        // Delete
        Route::delete('/{id}', [App\Http\Controllers\AttributeController::class, 'destroy']);
    });

    Route::group(['prefix' => 'attribute-value', 'middleware' => ['restrictIp', 'authVerify']], function () {
        // Bulk Actions
        Route::get('/test', [App\Http\Controllers\AttributeValueController::class, 'test']);
        Route::post('/bulk', [App\Http\Controllers\AttributeValueController::class, 'bulk']);

        // Drop Down List
        Route::get('/dropdown', [App\Http\Controllers\AttributeValueController::class, 'dropdown']);

        // Get All
        Route::get('/', [App\Http\Controllers\AttributeValueController::class, 'index']);

        // Get One
        Route::get('/{id}', [App\Http\Controllers\AttributeValueController::class, 'show']);

        // Create
        Route::post('/', [App\Http\Controllers\AttributeValueController::class, 'store']);

        // Update (Check Validation)
        Route::put('/{id}', [App\Http\Controllers\AttributeValueController::class, 'update']);

        // Update Partial (Without Validation)
        Route::patch('/{id}', [App\Http\Controllers\AttributeValueController::class, 'updateFields']);

        // Delete
        Route::delete('/{id}', [App\Http\Controllers\AttributeValueController::class, 'destroy']);
    });

    Route::group(['prefix' => 'item', 'middleware' => ['restrictIp', 'authVerify']], function () {

        Route::get('/export/{file}', [App\Http\Controllers\ItemController::class, 'export']);
        // Route::post('/update-item-name', [App\Http\Controllers\ItemController::class, 'updateItemName']);
        // Route::get('/check-latest-code', [App\Http\Controllers\ItemController::class, 'checkLatestCode']);

        // Bulk Actions
        Route::post('/bulk-store', [App\Http\Controllers\ItemController::class, 'bulkStore']);
        Route::post('/bulk', [App\Http\Controllers\ItemController::class, 'bulk']);

        // Drop Down List
        Route::get('/dropdown', [App\Http\Controllers\ItemController::class, 'dropdown']);

        // Get All
        Route::get('/', [App\Http\Controllers\ItemController::class, 'index']);

        // Get One
        Route::get('/{id}', [App\Http\Controllers\ItemController::class, 'show']);

        // Create
        Route::post('/', [App\Http\Controllers\ItemController::class, 'store']);

        // Update (Check Validation)
        Route::put('/{id}', [App\Http\Controllers\ItemController::class, 'update']);

        // Update Partial (Without Validation)
        Route::patch('/{id}', [App\Http\Controllers\ItemController::class, 'updateFields']);

        // Delete
        Route::delete('/{id}', [App\Http\Controllers\ItemController::class, 'destroy']);
    });

    Route::group(['prefix' => 'workflow', 'middleware' => ['restrictIp', 'authVerify']], function () {
        // Git By Where
        Route::get('/getByWhere', [App\Http\Controllers\WorkflowController::class, 'getByWhere']);

        // Bulk Actions
        Route::post('/bulk', [App\Http\Controllers\WorkflowController::class, 'bulk']);

        // Drop Down List
        Route::get('/dropdown', [App\Http\Controllers\WorkflowController::class, 'dropdown']);

        // Get All
        Route::get('/', [App\Http\Controllers\WorkflowController::class, 'index']);

        // Get One
        Route::get('/{id}', [App\Http\Controllers\WorkflowController::class, 'show']);

        // Create
        Route::post('/', [App\Http\Controllers\WorkflowController::class, 'store']);

        // Update (Check Validation)
        Route::put('/{id}', [App\Http\Controllers\WorkflowController::class, 'update']);

        // Update Partial (Without Validation)
        Route::patch('/{id}', [App\Http\Controllers\WorkflowController::class, 'updateFields']);

        // Delete
        Route::delete('/{id}', [App\Http\Controllers\WorkflowController::class, 'destroy']);
    });

    Route::group(['prefix' => 'workflow-step', 'middleware' => ['restrictIp', 'authVerify']], function () {
        // Git By Where
        Route::get('/getByWhere', [App\Http\Controllers\WorkflowStepController::class, 'getByWhere']);

        // Bulk Actions
        Route::post('/bulk', [App\Http\Controllers\WorkflowStepController::class, 'bulk']);

        // Drop Down List
        Route::get('/dropdown', [App\Http\Controllers\WorkflowStepController::class, 'dropdown']);

        // Get All
        Route::get('/', [App\Http\Controllers\WorkflowStepController::class, 'index']);

        // Get One
        Route::get('/{id}', [App\Http\Controllers\WorkflowStepController::class, 'show']);

        // Create
        Route::post('/', [App\Http\Controllers\WorkflowStepController::class, 'store']);

        // Update (Check Validation)
        Route::put('/{id}', [App\Http\Controllers\WorkflowStepController::class, 'update']);

        // Update Partial (Without Validation)
        Route::patch('/{id}', [App\Http\Controllers\WorkflowStepController::class, 'updateFields']);

        // Delete
        Route::delete('/{id}', [App\Http\Controllers\WorkflowStepController::class, 'destroy']);
    });

    Route::group(['prefix' => 'workflow-transition', 'middleware' => ['restrictIp', 'authVerify']], function () {
        // Git By Where
        Route::get('/getByWhere', [App\Http\Controllers\WorkflowTransitionController::class, 'getByWhere']);

        // Get All
        Route::get('/', [App\Http\Controllers\WorkflowTransitionController::class, 'index']);

        // Get One
        Route::get('/{id}', [App\Http\Controllers\WorkflowTransitionController::class, 'show']);

        // Create
        Route::post('/', [App\Http\Controllers\WorkflowTransitionController::class, 'store']);

        // Update (Check Validation)
        Route::put('/{id}', [App\Http\Controllers\WorkflowTransitionController::class, 'update']);

        // Update Partial (Without Validation)
        Route::patch('/{id}', [App\Http\Controllers\WorkflowTransitionController::class, 'updateFields']);

        // Delete
        Route::delete('/{id}', [App\Http\Controllers\WorkflowTransitionController::class, 'destroy']);
    });

    Route::group(['prefix' => 'govt-holiday', 'middleware' => ['restrictIp', 'authVerify']], function () {
        // Git By Where
        Route::get('/getByWhere', [App\Http\Controllers\GovtHolidayController::class, 'getByWhere']);

        // Get All
        Route::get('/', [App\Http\Controllers\GovtHolidayController::class, 'index']);

        // Get One
        Route::get('/{id}', [App\Http\Controllers\GovtHolidayController::class, 'show']);

        // Create
        Route::post('/', [App\Http\Controllers\GovtHolidayController::class, 'store']);

        // Update (Check Validation)
        Route::put('/{id}', [App\Http\Controllers\GovtHolidayController::class, 'update']);

        // Update Partial (Without Validation)
        Route::patch('/{id}', [App\Http\Controllers\GovtHolidayController::class, 'updateFields']);

        // Delete
        Route::delete('/{id}', [App\Http\Controllers\GovtHolidayController::class, 'destroy']);
    });
    // BACK_OFFICE_SETUP: END

    // RREQISITION
    Route::group(['prefix' => 'requisition', 'middleware' => ['restrictIp', 'authVerify']], function () {
        // Item Wise Disbursement Details
        Route::get('/item-disbursement-details', [App\Http\Controllers\RequisitionController::class, 'getItemDisbursementDetails']);

        Route::get('/export/{file}', [App\Http\Controllers\RequisitionController::class, 'export']);
        // Bulk Actions
        Route::post('/bulk-store', [App\Http\Controllers\RequisitionController::class, 'bulkStore']);
        Route::post('/bulk', [App\Http\Controllers\RequisitionController::class, 'bulk']);

        // Drop Down List
        Route::get('/dropdown', [App\Http\Controllers\RequisitionController::class, 'dropdown']);

        // Get All
        Route::get('/', [App\Http\Controllers\RequisitionController::class, 'index']);

        // Get One
        Route::get('/{id}', [App\Http\Controllers\RequisitionController::class, 'show']);

        // Create
        Route::post('/', [App\Http\Controllers\RequisitionController::class, 'store']);

        // Update (Check Validation)
        Route::put('/{id}', [App\Http\Controllers\RequisitionController::class, 'update']);
        Route::put('/acknowledge/{id}', [App\Http\Controllers\RequisitionController::class, 'acknowledge']);

        // Update Partial (Without Validation)
        Route::patch('/{id}', [App\Http\Controllers\RequisitionController::class, 'updateFields']);

        // Delete
        Route::delete('/{id}', [App\Http\Controllers\RequisitionController::class, 'destroy']);
    });

    // REQUISITION APPROVAL
    Route::group(['prefix' => 'approval-requisition', 'middleware' => ['restrictIp', 'authVerify']], function () {
        // Get All
        Route::get('/', [App\Http\Controllers\Approval\RequisitionApprovalController::class, 'index']);

        // Get One
        Route::get('/{id}', [App\Http\Controllers\Approval\RequisitionApprovalController::class, 'show']);
    });

    // GOODS RECEIVE NOTE
    Route::group(['prefix' => 'goods-receive-note', 'middleware' => ['restrictIp', 'authVerify']], function () {

        // Item Wise Grn Details
        Route::get('/item-grn-details', [App\Http\Controllers\GoodsReceiveNoteController::class, 'getItemGrnDetails']);

        Route::get('/export/{file}', [App\Http\Controllers\GoodsReceiveNoteController::class, 'export']);
        // Route::post('/update-item-name', [App\Http\Controllers\GoodsReceiveNoteController::class, 'updateItemName']);
        // Route::get('/check-latest-code', [App\Http\Controllers\GoodsReceiveNoteController::class, 'checkLatestCode']);

        // Bulk Actions
        Route::post('/bulk-store', [App\Http\Controllers\GoodsReceiveNoteController::class, 'bulkStore']);
        Route::post('/bulk', [App\Http\Controllers\GoodsReceiveNoteController::class, 'bulk']);

        // Drop Down List
        Route::get('/dropdown', [App\Http\Controllers\GoodsReceiveNoteController::class, 'dropdown']);

        // Get All
        Route::get('/', [App\Http\Controllers\GoodsReceiveNoteController::class, 'index']);

        // Get One
        Route::get('/{id}', [App\Http\Controllers\GoodsReceiveNoteController::class, 'show']);
        Route::put('/update-process-status/{id}', [App\Http\Controllers\GoodsReceiveNoteController::class, 'updateProcesStatus']);

        // Create
        Route::post('/', [App\Http\Controllers\GoodsReceiveNoteController::class, 'store']);

        // Update (Check Validation)
        Route::put('/{id}', [App\Http\Controllers\GoodsReceiveNoteController::class, 'update']);

        // Update Partial (Without Validation)
        Route::patch('/{id}', [App\Http\Controllers\GoodsReceiveNoteController::class, 'updateFields']);

        // Delete
        Route::delete('/{id}', [App\Http\Controllers\GoodsReceiveNoteController::class, 'destroy']);
    });

    // GOODS RECEIVE NOTE APPROVAL
    Route::group(['prefix' => 'approval-goods-receive-note', 'middleware' => ['restrictIp', 'authVerify']], function () {
        // Get All
        Route::get('/', [App\Http\Controllers\Approval\GoodsReceiveNoteApprovalController::class, 'index']);

        // Get One
        Route::get('/{id}', [App\Http\Controllers\Approval\GoodsReceiveNoteApprovalController::class, 'show']);
    });

    // STOCK TRANSFER APPROVAL
    Route::group(['prefix' => 'approval-stock-transfer', 'middleware' => ['restrictIp', 'authVerify']], function () {
        // Get All
        Route::get('/', [App\Http\Controllers\Approval\StockTransferApprovalController::class, 'index']);
        // Get One
        Route::get('/{id}', [App\Http\Controllers\Approval\StockTransferApprovalController::class, 'show']);
    });

    // STOCK ADJUSTMENT
    Route::group(['prefix' => 'stock-adjustment', 'middleware' => ['restrictIp', 'authVerify']], function () {
        Route::post('/update-process-status/{id}', [App\Http\Controllers\StockAdjustmentController::class, 'stockProcessStatusUpdate']);
        Route::get('/export/{file}', [App\Http\Controllers\StockAdjustmentController::class, 'export']);
        // Route::post('/update-item-name', [App\Http\Controllers\StockAdjustmentController::class, 'updateItemName']);
        // Route::get('/check-latest-code', [App\Http\Controllers\StockAdjustmentController::class, 'checkLatestCode']);

        // Bulk Actions
        Route::post('/bulk-store', [App\Http\Controllers\StockAdjustmentController::class, 'bulkStore']);
        Route::post('/bulk', [App\Http\Controllers\StockAdjustmentController::class, 'bulk']);

        // Drop Down List
        Route::get('/dropdown', [App\Http\Controllers\StockAdjustmentController::class, 'dropdown']);

        // Get All
        Route::get('/', [App\Http\Controllers\StockAdjustmentController::class, 'index']);

        // Get One
        Route::get('/{id}', [App\Http\Controllers\StockAdjustmentController::class, 'show']);

        // Create
        Route::post('/', [App\Http\Controllers\StockAdjustmentController::class, 'store']);

        // Update (Check Validation)
        Route::put('/{id}', [App\Http\Controllers\StockAdjustmentController::class, 'update']);
        Route::put('/update-process-status/{id}', [App\Http\Controllers\StockAdjustmentController::class, 'updateProcessStatus']);

        // Update Partial (Without Validation)
        Route::patch('/{id}', [App\Http\Controllers\StockAdjustmentController::class, 'updateFields']);

        // Delete
        Route::delete('/{id}', [App\Http\Controllers\StockAdjustmentController::class, 'destroy']);
    });

    // STOCK ADJUSTMENT APPROVAL
    Route::group(['prefix' => 'approval-stock-adjustment', 'middleware' => ['restrictIp', 'authVerify']], function () {
        // Get All
        Route::get('/', [App\Http\Controllers\Approval\StockAdjustmentApprovalController::class, 'index']);

        // Get One
        Route::get('/{id}', [App\Http\Controllers\Approval\StockAdjustmentApprovalController::class, 'show']);
    });

    // ITEM CONSUMPTION
    Route::group(['prefix' => 'item-consumption', 'middleware' => ['restrictIp', 'authVerify']], function () {
        Route::get('/export/{file}', [App\Http\Controllers\ItemConsumptionController::class, 'export']);
        // Route::post('/update-item-name', [App\Http\Controllers\ItemConsumptionController::class, 'updateItemName']);
        // Route::get('/check-latest-code', [App\Http\Controllers\ItemConsumptionController::class, 'checkLatestCode']);
        Route::get('/branch-item-stock', [App\Http\Controllers\ItemConsumptionController::class, 'getBranchItemStock']);
        // Bulk Actions
        Route::post('/bulk-store', [App\Http\Controllers\ItemConsumptionController::class, 'bulkStore']);
        Route::post('/bulk', [App\Http\Controllers\ItemConsumptionController::class, 'bulk']);

        // Drop Down List
        Route::get('/dropdown', [App\Http\Controllers\ItemConsumptionController::class, 'dropdown']);

        // Get All
        Route::get('/', [App\Http\Controllers\ItemConsumptionController::class, 'index']);

        // Get One
        Route::get('/{id}', [App\Http\Controllers\ItemConsumptionController::class, 'show']);
        Route::put('/update-process-status/{id}', [App\Http\Controllers\ItemConsumptionController::class, 'updateProcesStatus']);

        // Create
        Route::post('/', [App\Http\Controllers\ItemConsumptionController::class, 'store']);

        // Update (Check Validation)
        Route::put('/{id}', [App\Http\Controllers\ItemConsumptionController::class, 'update']);

        // Update Partial (Without Validation)
        Route::patch('/{id}', [App\Http\Controllers\ItemConsumptionController::class, 'updateFields']);

        // Delete
        Route::delete('/{id}', [App\Http\Controllers\ItemConsumptionController::class, 'destroy']);
    });

    // STOCK TRANSFER
    Route::group(['prefix' => 'stock-transfer', 'middleware' => ['restrictIp', 'authVerify']], function () {
        Route::post('/update-process-status/{id}', [App\Http\Controllers\StockTransferController::class, 'stockProcessStatusUpdate']);
        Route::get('/export/{file}', [App\Http\Controllers\StockTransferController::class, 'export']);
        // Route::post('/update-item-name', [App\Http\Controllers\StockTransferController::class, 'updateItemName']);
        // Route::get('/check-latest-code', [App\Http\Controllers\StockTransferController::class, 'checkLatestCode']);

        // Bulk Actions
        Route::post('/bulk-store', [App\Http\Controllers\StockTransferController::class, 'bulkStore']);
        Route::post('/bulk', [App\Http\Controllers\StockTransferController::class, 'bulk']);

        // Drop Down List
        Route::get('/dropdown', [App\Http\Controllers\StockTransferController::class, 'dropdown']);

        // Get All
        Route::get('/', [App\Http\Controllers\StockTransferController::class, 'index']);

        // Get One
        Route::get('/{id}', [App\Http\Controllers\StockTransferController::class, 'show']);

        // Create
        Route::post('/', [App\Http\Controllers\StockTransferController::class, 'store']);

        // Update (Check Validation)
        Route::put('/{id}', [App\Http\Controllers\StockTransferController::class, 'update']);
        Route::put('/update-process-status/{id}', [App\Http\Controllers\StockTransferController::class, 'updateProcessStatus']);

        // Update Partial (Without Validation)
        Route::patch('/{id}', [App\Http\Controllers\StockTransferController::class, 'updateFields']);

        // Delete
        Route::delete('/{id}', [App\Http\Controllers\StockTransferController::class, 'destroy']);
    });

    Route::group(['prefix' => 'supplier', 'middleware' => ['restrictIp', 'authVerify']], function () {
        Route::get('/dropdown', [App\Http\Controllers\SupplierController::class, 'dropdown']);
        Route::get('/', [App\Http\Controllers\SupplierController::class, 'index']);
        Route::get('/{id}', [App\Http\Controllers\SupplierController::class, 'show']);
        Route::post('/', [App\Http\Controllers\SupplierController::class, 'store']);
        Route::put('/{id}', [App\Http\Controllers\SupplierController::class, 'update']);
        Route::patch('/{id}', [App\Http\Controllers\SupplierController::class, 'updateFields']);
        Route::delete('/{id}', [App\Http\Controllers\SupplierController::class, 'destroy']);
    });

    // REPORT
    Route::group(['prefix' => 'report', 'middleware' => ['restrictIp', 'authVerify']], function () {;
        Route::get('/requisition-analytic', [App\Http\Controllers\Report\RequisitionAnalyticReportController::class, 'getRequisitionAnalytic']);
        Route::get('/requisition-analytic-export', [App\Http\Controllers\Report\RequisitionAnalyticReportController::class, 'getRequisitionAnalyticExport']);
        Route::get('/item-stock', [App\Http\Controllers\Report\ItemStockReportController::class, 'getItemStockList']);
        Route::get('/item-stock-export', [App\Http\Controllers\Report\ItemStockReportController::class, 'getItemStockExport']);
        Route::get('/item-lifecycle-stock', [App\Http\Controllers\Report\ItemStockReportController::class, 'getItemLifecycleStockReport']);
        Route::get('/item-low-stock', [App\Http\Controllers\Report\ItemLowStockReportController::class, 'getItemLowStocktList']);
        Route::get('/item-low-stock-export', [App\Http\Controllers\Report\ItemLowStockReportController::class, 'getItemLowStockExport']);
        Route::get('/item-requisition-status', [App\Http\Controllers\Report\ItemRequisitionStatusReportController::class, 'getItemRequisitionStatusReportList']);
        Route::get('/item-requisition-status-export', [App\Http\Controllers\Report\ItemRequisitionStatusReportController::class, 'getItemRequisitionStatusReportExport']);
        Route::get('/requester-wise-disbursement', [App\Http\Controllers\Report\RequesterWiseDisbursementReportController::class, 'getRequesterWiseDisbursementList']);
        Route::get('/requester-wise-disbursement-export', [App\Http\Controllers\Report\RequesterWiseDisbursementReportController::class, 'getRequesterWiseDisbursementExport']);
        Route::get('/item-wise-disbursement', [App\Http\Controllers\Report\ItemWiseDisbursementReportController::class, 'getItemWiseDisbursementList']);
        Route::get('/item-wise-disbursement-export', [App\Http\Controllers\Report\ItemWiseDisbursementReportController::class, 'getItemWiseDisbursementExport']);
        Route::get('/branch-wise-disbursement', [App\Http\Controllers\Report\ThanaWiseDisbursementReportController::class, 'getThanaWiseDisbursementList']);
        Route::get('/branch-wise-disbursement-export', [App\Http\Controllers\Report\ThanaWiseDisbursementReportController::class, 'getThanaWiseDisbursementExport']);
    });

    // EXPORT
    Route::group(['prefix' => 'export', 'middleware' => ['restrictIp', 'authVerify']], function () {});

    // PATIENT
    Route::group(['prefix' => 'patient', 'middleware' => ['restrictIp', 'authVerify']], function () {
        // Bulk Actions
        Route::post('/bulk', [App\Http\Controllers\PatientController::class, 'bulk']);

        // Drop Down List
        Route::get('/dropdown', [App\Http\Controllers\PatientController::class, 'dropdown']);

        // Get All
        Route::get('/', [App\Http\Controllers\PatientController::class, 'index']);

        // Get One
        Route::get('/{id}', [App\Http\Controllers\PatientController::class, 'show']);

        // Create
        Route::post('/', [App\Http\Controllers\PatientController::class, 'store']);

        // Update (Check Validation)
        Route::put('/{id}', [App\Http\Controllers\PatientController::class, 'update']);

        // Update Partial (Without Validation)
        Route::patch('/{id}', [App\Http\Controllers\PatientController::class, 'updateFields']);

        // Delete
        Route::delete('/{id}', [App\Http\Controllers\PatientController::class, 'destroy']);
    });
});
