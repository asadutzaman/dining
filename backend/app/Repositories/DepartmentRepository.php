<?php

namespace App\Repositories;

use App\Models\Department;
use App\Services\ODataService;

class DepartmentRepository extends BaseRepository
{
    /**
     * @var Department
     */
    protected $model;

    protected $request;

    protected $oDataService;

    protected $fieldSearchable = ['name', 'description'];

    public function __construct()
    {
        $this->model         = new Department();
    }
    protected function init()
    {
        $this->request      = request();
        $this->oDataService = (new ODataService())->init();
    }
}
