<?php

namespace App\Repositories;

use App\Models\RequestAccess;
use App\Services\ODataService;

class RequestAccessRepository extends BaseRepository
{
    /**
     * @var RequestAccess
     */
    protected $model;

    protected $request;

    protected $oDataService;

    protected $fieldSearchable = ['name', 'device_id', 'identifier'];

    public function __construct()
    {
        $this->model         = new RequestAccess();
    }
    protected function init()
    {
        $this->request      = request();
        $this->oDataService = (new ODataService())->init();
    }

    public function getDeviceInfoById($id)
    {
        return $this->findById($id);
    }

    public function getDeviceInfoByConditions(array $where, $columns = ['*'])
    {
        $query = $this->newQuery();

        foreach ($where as $field => $value) {
            if (is_array($value)) {
                list($field, $condition, $val) = $value;
                $query->where($field, $condition, $val);
            } else {
                $query->where($field, '=', $value);
            }
        }

        return $query->first($columns);
    }
}
