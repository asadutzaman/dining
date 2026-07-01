<?php

namespace App\Http\Controllers;

use App\Repositories\ApplicantProfileRepository;
use App\Repositories\BranchRepository;
use App\Services\JwtService;
use Illuminate\Http\Request;
use App\Services\ResourceService;
use App\Http\Resources\UserResource;
use App\Http\Resources\WorkflowApproverResource;
use App\Models\Resource;
use App\Repositories\UserRepository;
use App\Repositories\OrganogramRepository;
use App\Repositories\OrganizationRepository;
use App\Repositories\WorkflowApproverRepository;
use App\Traits\Controller\Functions\TraitRestResponse;
use Illuminate\Support\Arr;

class VerifyAccessTokenController extends Controller
{
    const USER_ADMIN_PK = 1;

    private $repository;

    use TraitRestResponse;

    public function __construct(UserRepository $repository)
    {
        $this->repository = $repository;
    }

    public function loadAuthState(Request $request)
    {
        try {

            $data = [];
            $jwtService = new JwtService();
            $tokenInfo = $jwtService->getTokeInfo();
            $userId = isset($tokenInfo->id) ?  $tokenInfo->id : null;
            if (!$userId) {
                return $this->authenticationRequiredResponse();
                // throw new \Exception('The access token is invalid.');
            }

            $user = $this->repository->getById($userId);
            if (!$user) {
                return $this->authenticationRequiredResponse();
                // throw new \Exception('The user does not exist.');
            }

            $userInfo = ResourceService::getResources($user, UserResource::class);

            $data['id'] = $userInfo->id;
            $data['user_id'] = $userInfo->id;
            $data['user_name'] = $userInfo->name ?? null;
            $data['user_email'] = $userInfo->email ?? null;
            $data['user_type'] = $userInfo->user_type ?? null;

            // Profile
            $profileRepository = new ApplicantProfileRepository();
            $profileInfo = $profileRepository->getDetailsByUserId($userId);
            $data['profile_id'] = $profileInfo->id ?? null;
            $data['profile_name_en'] = $profileInfo->name_en ?? null;
            $data['profile_name_bn'] = $profileInfo->name_bn ?? null;
            $data['profile_type'] = $profileInfo->registration_type ?? null;
            $data['profile_image'] = $profileInfo->photo ?? null;

            $organizationId = isset($tokenInfo->organization_id) ? $tokenInfo->organization_id : null;
            $organizationRepository = new OrganizationRepository();
            $organizationInfo = $organizationRepository->getOrganizationInfoById($organizationId);
            $data['organization_id'] = $organizationId ?? null;
            $data['organization_name_en'] = Arr::get($organizationInfo, 'name_en', null);
            $data['organization_name_bn'] = Arr::get($organizationInfo, 'name_bn', null);
            $data['organization_ids'] = $userInfo->organization_ids ?? [];


            $organogramId = isset($tokenInfo->organogram_id) ? $tokenInfo->organogram_id :  null;
            $organogramRepository = new OrganogramRepository();
            $organogramInfo = $organogramRepository->getOrganogramInfoById($organogramId);
            $data['organogram_id'] = $organogramId ?? null;
            $data['organogram_name_en'] = Arr::get($organogramInfo, 'name_en', null);
            $data['organogram_name_bn'] = Arr::get($organogramInfo, 'name_bn', null);
            $data['organogram_ids'] = $userInfo->organogram_ids ?? [];

            // $data['group_ids'] = $userInfo->group_ids ?? [];
            // $data['group_name_list'] = $userInfo->group_name_list ?? [];
            // $data['group_code_list'] = $userInfo->group_code_list ?? [];

            $data['role_ids'] = $userInfo->role_ids ?? [];
            $data['role_name_list'] = $userInfo->role_name_list ?? [];
            $data['role_code_list'] = $userInfo->role_code_list ?? [];

            $data['branch_id'] = $userInfo->branch_id ?? null;
            $data['branch_name'] = (new BranchRepository())->findById($userInfo->branch_id)->name ?? null;
            $data['logistic_id'] = $userInfo->logistic_id ?? null;
            // $data['department_id'] = $userInfo->department_id ?? null;
            // $data['manager_id'] = $userInfo->manager_id ?? null;

            $data['email'] = $userInfo->email ?? null;
            $data['phone'] = $userInfo->phone ?? null;
            $data['timezone'] = $userInfo->timezone ?? null;
            $data['profile_image'] = $userInfo->profile_image ?? null;
            $data['web_access'] = $userInfo->web_access ?? null;
            $data['app_access'] = $userInfo->app_access ?? null;
            $data['institute_organization_id'] = $userInfo->institute_organization_id ?? null;

            return $this->successResponse($data);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage());
        }
    }
}
