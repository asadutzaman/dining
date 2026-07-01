<?php

namespace App\Repositories;

use App\Models\Permission;
use App\Services\JwtService;
use App\Services\ODataService;

class PermissionRepository extends BaseRepository
{
    /**
     * @var Permission
     */
    protected $model;

    protected $request;

    protected $oDataService;

    protected $fieldSearchable = ['status'];

    public function __construct()
    {
        $this->model = new Permission();
    }

    protected function init()
    {
        $this->request = request();
        $this->oDataService = (new ODataService())->init();
    }

    public function getPermissionList($roleId)
    {
        return $this->newQuery()
            ->where(['role_id' => $roleId])
            ->get();
    }

    public function getPermissionListByRole($roleId)
    {
        $data = [];
        $resourceRepository = new ResourceRepository();
        $scopeRepository = new ScopeRepository();

        $items = $resourceRepository->newQuery()
            ->select(['id', 'name', 'display_name', 'permission_type'])
            ->where(['status' => 1])
            ->orderBy('sort_order')
            ->orderBy('display_name')
            ->get();

        foreach ($items as $key => $resource) {
            $scopeItems = $scopeRepository->newQuery()
                ->select(['id', 'resource_id', 'scope', 'display_name'])
                ->where(['resource_id' => $resource->id])
                ->where(['status' => 1])
                ->orderBy('display_name')
                ->get();

            $data[$key] = $resource;
            $data[$key]['scopes'] = $scopeItems;

            foreach ($scopeItems as $scopeKey => $scope) {
                $permission = $this->newQuery()
                    ->where(['scope_id' => $scope->id])
                    ->where(['role_id' => $roleId])
                    ->first();

                $data[$key]['scopes'][$scopeKey]['checked'] = 0;
                if ($permission) {
                    $data[$key]['scopes'][$scopeKey]['checked'] = $permission->status;
                }
            }
        }

        return $data;
    }

    public function getUserPermissionList($userId)
    {
        $data = [];
        $userRepository = new UserRepository();
        $resourceRepository = new ResourceRepository();
        $scopeRepository = new ScopeRepository();

        $userRoleIds = $userRepository->getUserRoleIds($userId);

        $items = $resourceRepository->newQuery()
            ->select(['id', 'name', 'display_name', 'permission_type', 'component'])
            ->where(['status' => 1])
            ->orderBy('sort_order')
            ->orderBy('display_name')
            ->get();

        foreach ($items as $key => $resource) {
            $scopeItems = $scopeRepository->newQuery()
                ->select(['id', 'resource_id', 'scope', 'display_name'])
                ->where(['resource_id' => $resource->id])
                ->where(['status' => 1])
                ->orderBy('display_name')
                ->get();

            $data[$key] = $resource;
            $data[$key]['scopes'] = $scopeItems;

            foreach ($scopeItems as $scopeKey => $scope) {
                $permissionQuery = $this->newQuery();
                $permissionQuery->where(['scope_id' => $scope->id]);

                if (is_array($userRoleIds)) {
                    $permissionQuery->whereIn('role_id', $userRoleIds);
                } else {
                    $permissionQuery->where(['role_id' => $userRoleIds]);
                }

                $permission = $permissionQuery->first();

                $data[$key]['scopes'][$scopeKey]['checked'] = 0;
                if ($permission) {
                    $data[$key]['scopes'][$scopeKey]['checked'] = $permission->status;
                }
            }
        }

        return $data;
    }

    public function verifyAccessToken($token)
    {
        $jwtService = new JwtService();
        // $user = $jwtService->getUserFromToken($token);
        $user = $jwtService->checkToken($token);
        return $user;
    }
}
