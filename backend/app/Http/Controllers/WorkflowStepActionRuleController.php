<?php

namespace App\Http\Controllers;

use App\Http\Resources\WorkflowStepActionRuleResource;
use App\Repositories\WorkflowStepActionRuleRepository;
use App\Traits\Controller\RestControllerTrait;
use App\Validators\WorkflowStepActionRuleValidator;

class WorkflowStepActionRuleController extends Controller
{
    private $repository;

    private $validator;

    private $resource;

    private $partialUpdateFields = ['status'];

    use RestControllerTrait;

    public function __construct(WorkflowStepActionRuleRepository $repository, WorkflowStepActionRuleValidator $validator)
    {
        $this->repository = $repository;
        $this->validator = $validator;
        $this->resource = WorkflowStepActionRuleResource::class;
    }

}
