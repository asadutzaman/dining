<?php

namespace App\Repositories;

use App\Models\Organogram;
use App\Services\ODataService;
use App\Services\SessionService;
use Illuminate\Database\Eloquent\Builder;

class OrganogramRepository extends BaseRepository
{
    /**
     * @var Organogram
     */
    protected $model;

    protected $request;

    protected $oDataService;

    protected $fieldSearchable = ['name_en', 'name_bn', 'code', 'phone'];

    public function __construct()
    {
        $this->model         = new Organogram();
    }

    protected function init()
    {
        $this->request      = request();
        $this->oDataService = (new ODataService())->init();
    }

    protected function applyOrgFilters(Builder $query, array $filters = []): Builder
    {
        $sessionService = (new SessionService())->init();

        $userRoleCodeList = $sessionService->getUserRoleCodeList();
        if (in_array(config('app.group_super_admin_code'), $userRoleCodeList)) {
            return $query;
        }

        $organogramIds = $sessionService->getOrganogramIds();
        if (!empty($organogramIds)) {
            if (is_array($organogramIds)) {
                $query->whereIn('id', $organogramIds);
            } else {
                $query->where('id', $organogramIds);
            }
        }

        return $query;
    }

    public function getOrganogramInfoById($id)
    {
        if (empty($id)) {
            return null;
        }
        return $this->findById($id);
    }

    public function getOrganogramNameListById($ids)
    {
        if (empty($ids)) {
            return [];
        }

        return $this->newQuery()
            ->whereIn('id', (array) $ids)
            ->pluck('name_en')
            ->toArray();
    }

    public function getOrganogramTree()
    {
        $organograms = [];
        $query = $this->newQuery();
        $query = $this->applyOrgFilters($query);
        $organograms = $query->get()->toArray();
        return $this->buildTree($organograms);
    }

    public function getLabTree()
    {
        $organograms = [];
        $query = $this->newQuery();

        $query = $this->applyOrgFilters($query);
        $query->where('is_lab', true);
        $organograms = $query->get()->toArray();

        return $this->buildTree($organograms);
    }

    public function getOrganogramChildIds($organogramId)
    {
        $query = $this->newQuery();

        $query->where('parent_id', $organogramId);

        return $query->pluck('id')->toArray();
    }

    public function buildTree($organograms)
    {

        $idField = 'id';
        $foreignKey = 'parent_id'; //Set parent id
        $hash = array();
        $result = array();

        // hash to organograms by id
        foreach ($organograms as $row) {
            $hash[$row[$idField]] = $row;
            $hash[$row[$idField]]['key'] = 'key-' . $row['id'];
            $hash[$row[$idField]]['title'] = $row['name_en'];
        }
        $level = 1;
        foreach ($hash as $key => &$row) {
            //$hash[$row[$idField]]['level'] = $level;
            $parentId = $row[$foreignKey];

            // If this office has parent id in DB but no permission for this user then set parent id to 0
            if (!array_key_exists($parentId, $hash) && !is_null($parentId) && $parentId != 0) {
                $hash[$key][$foreignKey] = 0;
                $parentId = $row[$foreignKey];
            }


            if (!is_null($parentId) && $parentId != 0) {
                // add items field, if not available
                if (!in_array('children', $hash[$parentId])) {
                    $hash[$parentId] = $hash[$parentId] + array('children' => array());
                }
                // add row to parent item
                $hash[$parentId]['children'][] = &$row;
            }
            $level++;
        }

        foreach ($hash as &$row) {
            $parentId = $row[$foreignKey];

            if (is_null($parentId) || $parentId == 0) {
                $result[] = &$row;
            }
        }
        // print_r($result);exit;
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
