<?php

namespace App\Repositories;

use App\Models\Branch;
use App\Services\ODataService;

class BranchRepository extends BaseRepository
{
    /**
     * @var Branch
     */
    protected $model;

    protected $request;

    protected $oDataService;

    protected $fieldSearchable = ['type', 'name', 'address'];

    public function __construct()
    {
        $this->model         = new Branch();
    }
    protected function init()
    {
        $this->request      = request();
        $this->oDataService = (new ODataService())->init();
    }

    public function getBranchInfoById($id)
    {
        if (empty($id)) {
            return null;
        }
        return $this->findById($id);
    }

    public function getWarehouseInfo()
    {
        return $this->newQuery()
            ->where('type', 'Warehouse')
            ->first();
    }

    public function checkWarehouseExist($id = null)
    {
        return $this->newQuery()
            ->when(isset($id), function ($query) use ($id) {
                $query->whereNot('id', $id);
            })
            ->where('type', 'Warehouse')
            ->count() > 0 ? true : false;
    }

    public function getBranchChildIds($parentId)
    {
        if (empty($parentId)) {
            return [];
        }

        $childIds = $this->newQuery()
            ->where('parent_id', $parentId)
            ->pluck('id')
            ->toArray();

        foreach ($childIds as $childId) {
            $childIds = array_merge($childIds, $this->getBranchChildIds($childId));
        }

        return $childIds;
    }

    public function getBranchTree()
    {
        $query = $this->newQuery();
        $organograms = $query->get()->toArray();
        return $this->buildTree($organograms);
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
            $hash[$row[$idField]]['title'] = $row['name'];
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
}
