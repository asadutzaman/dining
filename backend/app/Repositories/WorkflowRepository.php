<?php

namespace App\Repositories;

use App\Models\Workflow;
use App\Services\ODataService;

class WorkflowRepository extends BaseRepository
{
    /**
     * @var Workflow
     */
    protected $model;

    protected $request;

    protected $oDataService;

    protected $fieldSearchable = ['title', 'description'];

    public function __construct()
    {
        $this->model         = new Workflow();
    }
    protected function init()
    {
        $this->request      = request();
        $this->oDataService = (new ODataService())->init();
    }
}
