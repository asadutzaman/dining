<?php

namespace App\Repositories;

use App\Models\WorkflowStep;
use App\Services\ODataService;

class WorkflowStepRepository extends BaseRepository
{
    /**
    * @var WorkflowStep
    */
    protected $model;

    protected $request;

    protected $oDataService;

    protected $fieldSearchable = ['title', 'description'];

    public function __construct()
    {
       $this->model         = new WorkflowStep();
        }
 protected function init()
    {
        $this->request      = request();
        $this->oDataService = (new ODataService())->init();
    }
}
