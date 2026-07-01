<?php

namespace App\Repositories;

use App\Models\WorkflowTransitionAssignment;
use App\Services\ODataService;

class WorkflowTransitionAssignmentRepository extends BaseRepository
{
    /**
    * @var WorkflowTransitionAssignment
    */
    protected $model;

    protected $request;

    protected $oDataService;

    protected $fieldSearchable = ['title', 'description'];

    public function __construct()
    {
       $this->model         = new WorkflowTransitionAssignment();
        }
 protected function init()
    {
        $this->request      = request();
        $this->oDataService = (new ODataService())->init();
    }
}
