<?php

namespace App\Http\Controllers;

use App\Http\Resources\WorkflowStepPreconditionResource;
use App\Repositories\WorkflowStepPreconditionRepository;
use App\Traits\Controller\RestControllerTrait;
use App\Validators\WorkflowStepPreconditionValidator;

class WorkflowStepPreconditionController extends Controller
{
    private $repository;

    private $validator;

    private $resource;

    private $partialUpdateFields = ['status'];

    use RestControllerTrait;

    public function __construct(WorkflowStepPreconditionRepository $repository, WorkflowStepPreconditionValidator $validator)
    {
        $this->repository = $repository;
        $this->validator = $validator;
        $this->resource = WorkflowStepPreconditionResource::class;
    }

}
