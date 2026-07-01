<?php

namespace App\Repositories;

use App\Models\Role;
use App\Services\ODataService;
use Illuminate\Database\Eloquent\Builder;

class RoleRepository extends BaseRepository
{
    /**
     * @var Role
     */
    protected $model;

    protected $request;

    protected $oDataService;

    protected $orgFilterFields = [''];

    protected $fieldSearchable = ['code', 'name', 'description'];

    public function __construct()
    {
        $this->model        = new Role();
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
            $query->orWhere('code', 'like', "%{$search}%");
            $query->orWhere('name', 'like', "%{$search}%");
            $query->orWhere('description', 'like', "%{$search}%");
        });

        return $query;
    }

    public function getRoleInfoById($id)
    {
        return $this->findById($id);
    }

    public function getAdminUserRoleInfo()
    {
        return $this->findBy('code', 'ROLE_SUPER_ADMIN');
    }

    public function getRoleNameById($id)
    {
        $result = $this->findById($id);
        return isset($result->name) ? $result->name : '';
    }

    public function getRoleNameList($roleIds)
    {
        if (empty($roleIds)) {
            return null;
        }

        $query = $this->newQuery();

        if (is_array($roleIds)) {
            $query->whereIn('id', $roleIds);
        } else {
            $ids = explode(",", $roleIds);
            if (is_array($ids)) {
                $query->whereIn('id', $ids);
            } else {
                $query->where('id', $ids);
            }
        }

        return $query->pluck('name');
    }

    public function getRoleCodeList($roleIds)
    {
        if (empty($roleIds)) {
            return null;
        }

        $query = $this->newQuery();

        if (is_array($roleIds)) {
            $query->whereIn('id', $roleIds);
        } else {
            $ids = explode(",", $roleIds);
            if (is_array($ids)) {
                $query->whereIn('id', $ids);
            } else {
                $query->where('id', $ids);
            }
        }

        return $query->pluck('code');
    }
}
