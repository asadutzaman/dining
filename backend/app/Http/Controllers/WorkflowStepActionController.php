<?php

namespace App\Http\Controllers;

use App\Http\Resources\WorkflowStepActionResource;
use App\Repositories\WorkflowStepActionRepository;
use App\Traits\Controller\RestControllerTrait;
use App\Validators\WorkflowStepActionValidator;

class WorkflowStepActionController extends Controller
{
    private $repository;

    private $validator;

    private $resource;

    private $partialUpdateFields = ['status'];

    use RestControllerTrait;

    public function __construct(WorkflowStepActionRepository $repository, WorkflowStepActionValidator $validator)
    {
        $this->repository = $repository;
        $this->validator = $validator;
        $this->resource = WorkflowStepActionResource::class;
    }

}
