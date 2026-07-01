<?php

namespace App\Repositories;

use App\Models\Workspace;
use App\Services\ODataService;

class WorkspaceRepository extends BaseRepository
{
    /**
     * @var Workspace
     */
    protected $model;

    protected $request;

    protected $oDataService;

    protected $fieldSearchable = ['name'];

    public function __construct()
    {
        $this->model         = new Workspace();
    }
    protected function init()
    {
        $this->request      = request();
        $this->oDataService = (new ODataService())->init();
    }
}
