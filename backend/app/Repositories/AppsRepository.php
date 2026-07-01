<?php

namespace App\Repositories;

use App\Models\Apps;
use App\Services\ODataService;

class AppsRepository extends BaseRepository
{
    /**
    * @var Apps
    */
    protected $model;

    protected $request;

    protected $oDataService;

    protected $fieldSearchable = ['code', 'name'];

    public function __construct()
    {
        $this->model        = new Apps();
        }
 protected function init()
    {
        $this->request      = request();
        $this->oDataService = (new ODataService())->init();
    }
}
