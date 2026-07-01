<?php

namespace App\Repositories;

use App\Models\Group;
use App\Services\ODataService;
use Illuminate\Support\Facades\Log;

class GroupRepository extends BaseRepository
{
    /**
     * @var Group
     */
    protected $model;

    protected $request;

    protected $oDataService;

    protected $orgFilterFields = [''];

    protected $fieldSearchable = ['code', 'name', 'description'];

    public function __construct()
    {
        $this->model        = new Group();
    }

    protected function init()
    {
        $this->request      = request();
        $this->oDataService = (new ODataService())->init();
    }

    public function getGroupInfoById($id)
    {
        return $this->findById($id);
    }

    public function getGroupNameById($id)
    {
        $result = $this->findById($id);
        return isset($result->name) ? $result->name : '';
    }

    public function getGroupNameList($groupIds)
    {
        if (empty($groupIds)) {
            return null;
        }

        $query = $this->newQuery();

        if (is_array($groupIds)) {
            $query->whereIn('id', $groupIds);
        } else {
            $ids = explode(",", $groupIds);
            if (is_array($ids)) {
                $query->whereIn('id', $ids);
            } else {
                $query->where('id', $ids);
            }
        }

        return $query->pluck('name');
    }

    public function getGroupCodeList($groupIds)
    {
        if (empty($groupIds)) {
            return null;
        }

        $query = $this->newQuery();

        if (is_array($groupIds)) {
            $query->whereIn('id', $groupIds);
        } else {
            $ids = explode(",", $groupIds);
            if (is_array($ids)) {
                $query->whereIn('id', $ids);
            } else {
                $query->where('id', $ids);
            }
        }

        return $query->pluck('code');
    }

    public function getGroupRoleIds($groupIds)
    {
        if (empty($groupIds)) {
            return null;
        }
        $query = $this->newQuery();

        if (is_array($groupIds)) {
            $query->whereIn('id', $groupIds);
        } else {
            // $ids = explode(",", $groupIds); //NOT WORKING ON MULTIPLE GROUP
            $ids = json_decode($groupIds);
            if (is_array($ids)) {
                $query->whereIn('id', $ids);
            } else {
                $query->where('id', $ids);
            }
        }

        $roleIds = [];
        // $items = $query->pluck('role_ids');
        $items = $query->pluck('role_ids')->toArray();

        if (empty($items)) {
            return null;
        }

        foreach ($items as $item) {
            // $item = json_decode($item);
            $roleIds = array_merge($roleIds, $item);
        }
        // NO NEEDED
        // $roleIds = array_merge($roleIds, $items);
        // Log::info($roleIds);


        return $roleIds;
    }
}
