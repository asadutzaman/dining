<?php

namespace App\Repositories;

// use App\ApiService\Scm\WorkflowStepApiService;
use App\Models\User;
use App\Services\ODataService;
use App\Services\SessionService;
use Illuminate\Database\Eloquent\Builder;

class UserRepository extends BaseRepository
{
    /**
     * @var User
     */
    protected $model;

    protected $request;

    protected $oDataService;

    protected $orgFilterFields = [''];

    protected $fieldSearchable = ['name', 'email', 'phone'];

    public function __construct()
    {
        $this->model        = new User();
    }

    protected function init()
    {
        $this->request      = request();
        $this->oDataService = (new ODataService())->init();
    }

    protected function applySearch(Builder $query, string $search): Builder
    {
        $query->whereNotIn('status', [2]);

        if (empty($search)) {
            return $query;
        }

        $query->where(function (Builder $query) use ($search) {
            $query->orWhere('name', 'like', "%{$search}%");
            $query->orWhere('email', 'like', "%{$search}%");
            $query->orWhere('phone', 'like', "%{$search}%");
        });

        return $query;
    }

    public function getAdminUserInfo()
    {
        $roleRepository = new RoleRepository();
        $adminUserRoleInfo = $roleRepository->getAdminUserRoleInfo();
        if (empty($adminUserRoleInfo)) {
            return null;
        }
        return $this->findWhereIn('role_ids', [$adminUserRoleInfo->id]);
    }

    public function getUserNameById($id)
    {
        $result = $this->findById($id);
        return isset($result->name) ? $result->name : '';
    }

    public function getGlobalState($userId)
    {
        $data = [];

        $sessionService = (new SessionService())->init();
        $options = $sessionService->getOptions();

        // User
        $user = $this->getUserInfo($userId);
        $data['userId']       = $user->id;
        $data['profileImage'] = $user->profile_image;

        // Group
        // $data['groupId'] = $user->group_ids ?? '';

        // Department
        $data['departmentId'] = $user->department_id ?? '';

        // Designation
        $data['designationId'] = $user->designation_id ?? '';

        // Role
        try {
            $role = $this->getRoleInfo($user->role_id);
            $data['roleId'] = $user->role_id;
            $data['role'] = [
                'uuid'        => $role->uuid,
                'code'        => $role->code,
                'name'        => $role->name,
                'description' => $role->description,
            ];
        } catch (\Exception $e) {
            $data['roleId'] = '';
            $data['role'] = [
                'uuid'        => '',
                'code'        => '',
                'name'        => '',
                'description' => '',
            ];
        }

        // APK Version
        $data['apk_latest_version'] = isset($options['mobile_app_android_version']) ? $options['mobile_app_android_version'] : '';

        // User Workflow Steps
        // $workflowStepApiService = new WorkflowStepApiService();
        // $data['userWorkflowSteps'] = $workflowStepApiService->loadUserWorkflowStep($user->id, $user->role_id);

        // Organization
        $data['organizationId'] = $user->organization_id ?? '';

        // Workspace
        $data['organogram_id'] = $user->organogram_id ?? '';

        // Scopes
        try {
            $scopeList = $this->getUserScopes($userId);
            $data['scopes'] = $scopeList;
        } catch (\Exception $e) {
            $data['scopes'] = '';
        }

        return $data;
    }

    public function getUserScopes($userId)
    {
        $userRoleIds = $this->getUserRoleIds($userId);
        $rolesWisePermissionList = $this->getRolesWisePermission($userRoleIds, $userId);

        $permissionList =  $rolesWisePermissionList->map->only(['scope_id', 'field_access', 'status']);

        $scopeList = [];

        $scopeList[] = 'debug:userId:' . $userId;
        $scopeList[] = 'debug:roleIds:' . json_encode($userRoleIds);

        foreach ($permissionList as $item) {
            $scopeInfo = $this->getScopeInfoById($item['scope_id']);
            if ($scopeInfo) {
                if ($item['field_access']) {
                    $scope = $scopeInfo->scope . ':' . $item['field_access'];
                    $scopeList[] = $scope;
                } else {
                    $scopeList[] = $scopeInfo->scope;
                }
            }
        }
        return $scopeList;
    }

    public function getUserInfo($userId)
    {
        return $this->findBy('id', $userId);
    }

    public function getGroupInfo($groupId)
    {
        $groupRepository = new GroupRepository();
        return $groupRepository->findBy('id', $groupId);
    }

    public function getRoleInfo($roleId)
    {
        $roleRepository = new RoleRepository();
        return $roleRepository->findBy('id', $roleId);
    }

    public function getUserGroupInfo($groupIds)
    {
        $groupArray = explode(' ', $groupIds);
        $groupRepository = new GroupRepository();
        return $groupRepository->findBy('id', $groupArray);
    }

    public function getUserRoleIds($userId)
    {
        $query = $this->newQuery();

        $query->where('id', $userId);

        $result = $query->first();

        return !empty($result) ? $result->role_ids : null;
    }

    public function getUserGroupIds($userId)
    {
        $query = $this->newQuery();

        $query->where('id', $userId);

        $result = $query->first();

        return !empty($result) ? $result->group_ids : null;
    }

    // public function getUserRoleIds($userId)
    // {
    //     $groupIds = $this->getUserGroupIds($userId);

    //     if (empty($groupIds)) {
    //         return null;
    //     }

    //     $groupRepository = new GroupRepository();
    //     return $groupRepository->getGroupRoleIds($groupIds);
    // }

    public function updateUserRole($userId, $roleId)
    {
        $updateFields = ['role_id' => $roleId];
        return $this->update($updateFields, $userId);
    }

    public function getWorkspaceInfo($workspaceId)
    {
        $workspaceRepository = new WorkspaceRepository();
        return $workspaceRepository->findBy('id', $workspaceId);
    }

    public function getOrganizationInfo($orgId)
    {
        $organizationRepository = new OrganizationRepository();
        return $organizationRepository->findBy('id', $orgId);
    }

    public function getRolesWisePermission($roleIds, $userId)
    {
        if (empty($roleIds)) {
            return [];
        }

        $permissionRepository = new PermissionRepository();
        $query = $permissionRepository->newQuery();
        $query->where(['status' => 1]);

        if (is_array($roleIds)) {
            $query->whereIn('role_id', $roleIds);
        } else {
            $query->where('role_id', $roleIds);
        }

        return $query->get();
    }

    public function getUserWisePermission($userId)
    {
        $permissionRepository = new PermissionRepository();
        return $permissionRepository->newQuery()
            ->where(['user_id' => $userId])
            ->get();
    }

    public function getScopeInfoById($scopeId)
    {
        $scopeRepository = new ScopeRepository();
        return $scopeRepository->newQuery()
            ->where(['id' => $scopeId])
            ->first();
    }

    public function getByDeviceId($deviceId)
    {
        return $this->findBy('device_id', $deviceId);
    }

    public function getUserDesignationById($userId)
    {
        $userInfo = $this->findById($userId);
        if (!empty($userInfo->designation_id)) {
            $designationRepository = new DesignationRepository();
            return $designationRepository->findById($userInfo->designation_id)->title ?? '';
        }
        return '';
    }
}
