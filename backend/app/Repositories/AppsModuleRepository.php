<?php

namespace App\Repositories;

use App\Models\AppsModule;
use App\Services\ODataService;

class AppsModuleRepository extends BaseRepository
{
    /**
    * @var AppsModule
    */
    protected $model;

    protected $request;

    protected $oDataService;

    protected $fieldSearchable = ['code', 'name'];

    public function __construct()
    {
        $this->model        = new AppsModule();
    }

    protected function init()
    {
        $this->request      = request();
        $this->oDataService = (new ODataService())->init();
    }
}
