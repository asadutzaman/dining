<?php

namespace App\Repositories;

use App\Models\Employee;
use App\Services\ODataService;

class EmployeeRepository extends BaseRepository
{
    /**
     * @var Employee
     */
    protected $model;

    protected $request;

    protected $oDataService;

    protected $fieldSearchable = ['name_en', 'name_bn', 'mobile', 'employee_type'];

    public function __construct()
    {
        $this->model = new Employee();
    }

    protected function init()
    {
        $this->request = request();
        $this->oDataService = (new ODataService())->init();
    }

    public function getByUserId($userId)
    {
        return $this->findBy('user_id', $userId);
    }
}
