<?php

namespace App\Http\Controllers;

use App\Http\Resources\WorkflowStepTaskResource;
use App\Repositories\WorkflowStepTaskRepository;
use App\Traits\Controller\RestControllerTrait;
use App\Validators\WorkflowStepTaskValidator;

class WorkflowStepTaskController extends Controller
{
    private $repository;

    private $validator;

    private $resource;

    private $partialUpdateFields = ['status'];

    use RestControllerTrait;

    public function __construct(WorkflowStepTaskRepository $repository, WorkflowStepTaskValidator $validator)
    {
        $this->repository = $repository;
        $this->validator = $validator;
        $this->resource = WorkflowStepTaskResource::class;
    }

}
