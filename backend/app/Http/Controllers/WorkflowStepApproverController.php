<?php

namespace App\Http\Controllers;

use App\Http\Resources\WorkflowStepApproverResource;
use App\Repositories\WorkflowStepApproverRepository;
use App\Traits\Controller\RestControllerTrait;
use App\Validators\WorkflowStepApproverValidator;

class WorkflowStepApproverController extends Controller
{
    private $repository;

    private $validator;

    private $resource;

    private $partialUpdateFields = ['status'];

    use RestControllerTrait;

    public function __construct(WorkflowStepApproverRepository $repository, WorkflowStepApproverValidator $validator)
    {
        $this->repository = $repository;
        $this->validator = $validator;
        $this->resource = WorkflowStepApproverResource::class;
    }

}
