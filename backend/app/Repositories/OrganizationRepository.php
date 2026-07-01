<?php

namespace App\Repositories;

use App\Models\Organization;
use App\Services\CommonService;
use App\Services\ODataService;
use App\Services\SessionService;
use Illuminate\Database\Eloquent\Builder;

class OrganizationRepository extends BaseRepository
{
    /**
     * @var Organization
     */
    protected $model;

    protected $request;

    protected $oDataService;

    protected $fieldSearchable = ['name_en', 'name_bn', 'short_name'];

    public function __construct()
    {
        $this->model        = new Organization();
    }

    protected function init()
    {
        $this->request      = request();
        $this->oDataService = (new ODataService())->init();
    }

    protected function applyOrgFilters(Builder $query, array $filters = []): Builder
    {
        $sessionService = (new SessionService())->init();

        $userGroupCodeList = $sessionService->getUserGroupCodeList();
        if (in_array(config('app.group_super_admin_code'), $userGroupCodeList)) {
            return $query;
        }

        $organizationIds = $sessionService->getOrganizationIds();
        if (!empty($organizationIds)) {
            if (is_array($organizationIds)) {
                $query->whereIn('id', $organizationIds);
            } else {
                $query->where('id', $organizationIds);
            }
        }

        return $query;
    }

    public function getOrganizationInfoById($id)
    {
        if (empty($id)) {
            return null;
        }

        return $this->findById($id);
    }

    public function getOrganizationNameListByIds($ids)
    {
        if (empty($ids)) {
            return null;
        }
        $query = $this->newQuery();

        if (is_array($ids)) {
            $query->whereIn('id', $ids);
        } else {
            $ids = explode(",", $ids);
            if (is_array($ids)) {
                $query->whereIn('id', $ids);
            } else {
                $query->where('id', $ids);
            }
        }
        return $query->pluck('name_en')->toArray();
    }

    public function getOrganizationTree()
    {
        $query = $this->newQuery();
        $query = $this->applyOrgFilters($query);
        $result = $query->get()->toArray();

        return $this->buildTree($result);
    }

    function buildTree(array $data, $parentId = null, $level = 1)
    {
        $result = [];

        foreach ($data as $row) {
            if ($row['parent_id'] == $parentId) {
                $temp = [];
                $temp['id'] = $row['id'];
                $temp['parent_id'] = $row['parent_id'];
                $temp['title'] = $row['name_en'];
                $temp['key'] = 'key-' . $row['id'];
                $temp['level'] = $level;

                $children = $this->buildTree($data, $row['id'], $level + 1);
                if ($children) {
                    $temp['children'] = $children;
                }
                $result[] = $temp;
            }
        }

        return $result;
    }

    public function getChildOrganogram($parentId = 0)
    {
        return $this->newQuery()
            ->where('parent_id', $parentId)
            ->get();
    }

    public function hasChildOrganogram($parentId = 0)
    {
        $result = $this->newQuery()
            ->where('parent_id', $parentId)
            ->count();

        return (bool) $result;
    }

    public function getParentId($id)
    {
        return $this->newQuery()
            // ->where('status', 1)
            ->where('id', $id)
            ->pluck('parent_id')
            ->toArray();
    }

    public function getParentIds($id, $isAddPid = true, $reset = true)
    {
        static $cached = [];

        if ($reset) {
            $cached = [];
        }

        $parentIds = $this->getParentId($id);
        if ($parentIds) {
            foreach ($parentIds as $parentId) {
                if (!empty($parentId)) {
                    $cached = array_merge($cached, [$parentId]);
                    $this->getParentIds($parentId, false, false);
                }
            }
        }

        if ($isAddPid) {
            $cached[] = intval($id);
        }

        return $cached;
    }

    public function getChildId($parentId)
    {
        return $this->newQuery()
            // ->where('status', 1)
            ->where('parent_id', $parentId)
            ->pluck('id')
            ->toArray();
    }

    public function getChildIds($parentId = 0, $isAddPid = true, $reset = true)
    {
        static $cached = [];

        if ($reset) {
            $cached = [];
        }

        $childIds = $this->getChildId($parentId);
        if ($childIds) {
            foreach ($childIds as $childId) {
                $cached = array_merge($cached, [$childId]);
                $this->getChildIds($childId, false, false);
            }
        }

        if ($isAddPid) {
            $cached[] = intval($parentId);
        }

        return $cached;
    }
}
