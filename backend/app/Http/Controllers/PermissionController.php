<?php

namespace App\Http\Controllers;

use App\Constants\Common;
use App\Exceptions\DebugException;
use App\Exceptions\PermissionException;
use App\Http\Resources\PermissionResource;
use App\Repositories\PermissionRepository;
use App\Repositories\ScopeActionRepository;
use App\Repositories\ScopeRepository;
use App\Repositories\UserRepository;
use App\Services\CacheService;
use App\Services\SessionService;
use App\Traits\Controller\RestControllerTrait;
use App\Validators\PermissionValidator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class PermissionController extends Controller
{
    private $repository;

    private $validator;

    private $resource;

    private $partialUpdateFields = ['scope_id', 'role_id', 'user_id', 'status'];

    use RestControllerTrait;

    public function __construct(PermissionRepository $repository, PermissionValidator $validator)
    {
        $this->repository = $repository;
        $this->validator = $validator;
        $this->resource = PermissionResource::class;
    }

    public function rolePermission(Request $request, $roleId)
    {
        try {
            $result = $this->repository->getPermissionListByRole($roleId);
            return $this->successResponse($result);
        }
        catch (\Exception $e) {
            $this->errorResponse($e->getMessage());
        }
    }

    public function userPermission(Request $request, $userId)
    {
        try {
            $result = $this->repository->getUserPermissionList($userId);
            return $this->successResponse($result);
        }
        catch (\Exception $e) {
            $this->errorResponse($e->getMessage());
        }
    }

    public function savePermission(Request $request)
    {
        try {
            $data = [
                'scope_id' => $request->input('scope_id'),
                'role_id'  => $request->input('role_id'),
                'status'   => $request->input('status') == true ? 1 : 0,
            ];

            $entity = $this->repository->find([
                'scope_id' => $data['scope_id'],
                'role_id' => $data['role_id'],
            ])->first();

            if (!$entity) {
                $result =  $this->repository->create($data);
                return $this->successResponse($result);
            }
            else {
                $result = $this->repository->update($data, $entity->id);
                return $this->successResponse($result);
            }
        }
        catch (\Exception $e) {
            $this->errorResponse($e->getMessage());
        }
    }

    public function checkResourcePermission(Request $request)
    {
        try {
            $userId = null;
            $roleIds = null;

            $httpMethod = $request->post('httpMethod');
            $microservicePrefix = $request->post('microservicePrefix');
            $uris = $request->post('uris');

            $sessionService = (new SessionService())->init();
            $token = $sessionService->getUserToken();
            if (!empty($token)) {
                $user = $this->repository->verifyAccessToken($token);
                $userId = $user->id ?? null;

                $cacheKey = "permission.user.roleIds.{$userId}";
                $roleIds = Cache::remember($cacheKey, config('cache.duration.short'), function() use ($userId) {
                    $userRepository = new UserRepository();
                    return $userId ? $userRepository->getUserRoleIds($userId) : null;
                });
            }

            // Table: Scope
            $scopeActionRepository = new ScopeActionRepository();
            $scopeActionQuery = $scopeActionRepository->newQuery()
                ->select('scope_actions.resource_id', 'scope_actions.scope_id', 'scope_actions.http_method', 'scope_actions.uri', 'resources.display_name as resource_display_name', 'scopes.scope', 'scopes.display_name as scope_display_name', 'resources.component', 'resources.server_url_prefix')
                ->leftJoin('resources', 'resources.id', 'scope_actions.resource_id')
                ->leftJoin('scopes', 'scopes.id', 'scope_actions.scope_id')
                ->where('resources.server_url_prefix', '=', $microservicePrefix)
                ->whereNotNull('resources.server_url_prefix')
                ->where('scope_actions.http_method', '=', $httpMethod)
                ->whereNotNull('scope_actions.http_method')
                ->whereIn('scope_actions.uri', $uris)
                ->whereNotNull('scope_actions.uri');

            $cacheKey = CacheService::createCacheKey('permission.user.scope', [$scopeActionQuery->toSql(), $scopeActionQuery->getBindings(), $userId, $roleIds]);
            $scopeActionList = Cache::remember($cacheKey, config('cache.duration.short'), function() use ($scopeActionQuery) {
                return $scopeActionQuery->get();
            });

            if ($scopeActionList->isEmpty()) {
                return $this->successResponse(['code' => 200, 'message' => 'Allowed']);
            }

            // Table: Permission
            $scopeIds = $scopeActionList->pluck('scope_id')->toArray();
            $permissionQuery = $this->repository->newQuery()
                ->where('status', Common::STATUS_ACTIVE)
                ->whereIn('scope_id', $scopeIds)
                ->where(function ($query) use($userId, $roleIds) {
                    if ($userId) {
                        $query->where(['user_id' => $userId]);
                    }
                    $query->orWhere(function ($subQuery) use($userId, $roleIds) {
                        $subQuery->where('role_id', Common::ROLE_GUEST_PK);
                        if ($roleIds) {
                            if (is_array($roleIds)) {
                                $subQuery->orWhereIn('role_id', $roleIds);
                            }
                            else {
                                $subQuery->orWhere(['role_id' => $roleIds]);
                            }
                        }
                    });
                });

            $cacheKey = CacheService::createCacheKey('permission.user.scope.permission', [$permissionQuery->toSql(), $permissionQuery->getBindings(), $scopeIds, $userId, $roleIds]);
            $permission = Cache::remember($cacheKey, config('cache.duration.short'), function() use ($permissionQuery) {
                return $permissionQuery->first();
            });

            if (isset($permission->status) && $permission->status) {
                return $this->successResponse(['code' => 200, 'message' => 'Allowed']);
            }
            else {
                $scopeList = $scopeActionList->pluck('scope')->toArray();
                $resourceNameList = $scopeActionList->pluck('resource_display_name')->toArray();
                $scopeNameList = $scopeActionList->pluck('scope_display_name')->toArray();
                $message = "You do not have permission to access this resource. " . json_encode(['scopeList' => $scopeList, 'resourceName' => $resourceNameList[0], 'scopeNameList' => $scopeNameList]);
                throw new PermissionException($message);
            }
        }
        catch (\Exception $e) {
            throw $e;
        }
    }

}
