<?php

namespace App\Services;

use App\Http\Resources\UserResource;
use App\Repositories\ApplicantProfileRepository;
use App\Repositories\BranchRepository;
use App\Repositories\RoleRepository;
use App\Repositories\UserRepository;
use App\Repositories\GroupRepository;
use App\Repositories\LogisticRepository;
use App\Repositories\OptionRepository;
// use App\ApiService\Core\OptionApiService;
use App\Repositories\OrganogramRepository;
use App\Repositories\OrganizationRepository;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Cache;

class SessionService
{
    static $instance = null;

    private $jwtService;

    private $userRepository;

    private $groupRepository;

    private $roleRepository;

    private $optionRepository;

    private $organogramRepository;

    private $organizationRepository;

    private $branchRepository;

    private $logisticRepository;

    private $userData = [];

    private $scopes = [];

    private $options = [];

    private $userProfileId;

    private $organogramId;

    private $organogramIds = [];

    private $organizationId;

    private $token;

    private $organizationIds = [];

    function __construct()
    {
        $this->jwtService = new JwtService();
        $this->userRepository = new UserRepository();
        $this->groupRepository = new GroupRepository();
        $this->roleRepository = new RoleRepository();
        $this->optionRepository = new OptionRepository();
        $this->organogramRepository = new OrganogramRepository();
        $this->organizationRepository = new OrganizationRepository();
        $this->branchRepository = new BranchRepository();
        $this->logisticRepository = new LogisticRepository();
    }

    public function init()
    {
        $this->loadSessionData();
        return $this;
    }

    public function loadSessionData()
    {
        $tokenInfo = $this->jwtService->getTokeInfo();

        if (empty($tokenInfo)) {
            return [];
        }

        $this->token = $this->jwtService->getTokenForRequest();

        $userId = isset($tokenInfo->id) ? $tokenInfo->id : null;
        if (empty($userId)) {
            return [];
        }

        // User
        $cacheKey = "session.user.id.{$userId}." . md5($this->token);
        $this->userData = Cache::remember($cacheKey, config('cache.duration.short'), function () use ($userId) {
            $user = $this->userRepository->getById($userId);
            return ResourceService::getResources($user, UserResource::class);
        });

        if (empty($this->userData)) {
            return [];
        }

        // Profile
        $cacheKey = "session.user.profile.{$userId}." . md5($this->token);
        $this->userProfileId = Cache::remember($cacheKey, config('cache.duration.short'), function () use ($userId) {
            $profileRepository = new ApplicantProfileRepository();
            $profileInfo = $profileRepository->getDetailsByUserId($userId);
            return $profileInfo->id ?? null;
        });

        // Scopes
        $cacheKey = "session.user.scope.{$userId}." . md5($this->token);
        $this->scopes = Cache::remember($cacheKey, config('cache.duration.short'), function () use ($userId) {
            return $this->userRepository->getUserScopes($userId);
        });

        // Organogram
        $this->organogramId = isset($tokenInfo->organogram_id) ? $tokenInfo->organogram_id : null;
        $this->organogramIds = $this->userData->organogram_ids;

        // Organization
        $this->organizationId = isset($tokenInfo->organization_id) ? $tokenInfo->organization_id : null;
        $this->organizationIds = $this->userData->organization_ids;

        // Options
        $cacheKey = "session.site.options.{$userId}." . md5($this->token);
        $this->options = Cache::remember($cacheKey, config('cache.duration.short'), function () {
            return $this->optionRepository->loadOption();
        });
    }

    public function getSessionData()
    {
        return [
            'authServerToken' => $this->getUserToken(),

            'organizationId' => $this->getOrganizationId(),
            'organizationIds' => $this->getOrganizationIds(),
            'userAssignedOrganizationIds' => $this->getAllUserAssignedOrganizationIds(),

            'organogramId' => $this->getOrganogramId(),
            'organogramIds' => $this->getOrganogramIds(),
            'userAssignedOrganogramIds' => $this->getAllUserAssignedOrganogramIds(),

            'userData' => $this->getUserData(),
            'userId' => $this->getUserId(),
            'userProfileId' => $this->getUserProfileId(),
            'userDesignationId' => $this->getUserDesignationId(),
            'userDepartmentId' => $this->getUserDepartmentId(),
            // 'userGroupIds' => $this->getUserGroupIds(),
            'userGroupNameList' => $this->getUserGroupNameList(),
            'userGroupCodeList' => $this->getUserGroupCodeList(),
            'userRoleIds' => $this->getUserRoleIds(),
            'userRoleNameList' => $this->getUserRoleNameList(),
            'userRoleCodeList' => $this->getUserRoleCodeList(),

            'scopes' => $this->getUserScopes(),
            'options' => $this->getOptions(),
        ];
    }

    public function getUserToken()
    {
        return $this->token ?? '';
    }

    public function getUserData()
    {
        return [
            'id' => $this->userData->id ?? '',
            'uuid' => $this->userData->uuid ?? '',
            'name' => $this->userData->name ?? '',
            'email' => $this->userData->email ?? '',
            'phone' => $this->userData->phone ?? '',
            'branch_id' => $this->userData->branch_id ?? '',
            'logistic_id' => $this->userData->logistic_id ?? '',
            'is_verified' => $this->userData->is_verified ?? '',
            'status' => $this->userData->status ?? '',
        ];
    }

    public function getUserId()
    {
        return $this->userData->id ?? '';
    }

    public function getUserDesignationId()
    {
        return $this->userData->designation_id ?? '';
    }

    public function getUserDepartmentId()
    {
        return $this->userData->department_id ?? '';
    }

    public function getUserGroupIds()
    {
        return $this->userData->group_ids ??  [];
    }

    public function getUserGroupNameList()
    {
        return $this->userData->group_name_list ??  [];
    }

    public function getUserGroupCodeList()
    {
        return $this->userData->group_code_list ??  [];
    }

    public function getUserRoleIds()
    {
        return $this->userData->role_ids ??  [];
    }

    public function getUserRoleNameList()
    {
        return $this->userData->role_name_list ??  [];
    }

    public function getUserRoleCodeList()
    {
        return $this->userData->role_code_list ??  [];
    }

    public function getUserScopes()
    {
        return $this->scopes ?? [];
    }

    public function getOptions()
    {
        return $this->options ?? [];
    }

    public function getUserProfileId()
    {
        return $this->userProfileId ?? '';
    }

    public function getOrganogramId()
    {
        return $this->organogramId ?? '';
    }

    public function getAllUserAssignedOrganogramIds()
    {
        return $this->userData->organogram_ids ??  [];
    }

    public function getOrganogramIds()
    {
        return $this->userData->organogram_ids ??  [];
    }

    public function getOrganizationId()
    {
        return $this->organizationId ?? '';
    }

    public function getAllUserAssignedOrganizationIds()
    {
        return $this->userData->organization_ids ??  [];
    }

    public function getOrganizationIds()
    {
        return $this->userData->organization_ids ??  [];
    }

    public function getUserBranchId()
    {
        return $this->userData->branch_id ??  null;
    }
}
