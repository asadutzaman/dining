<?php

namespace App\Http\Controllers;

use App\Http\Resources\WorkflowResource;
use App\Repositories\WorkflowRepository;
use App\Traits\Controller\RestControllerTrait;
use App\Validators\WorkflowValidator;

class WorkflowController extends Controller
{
    private $repository;

    private $validator;

    private $resource;

    private $partialUpdateFields = ['status'];

    use RestControllerTrait;

    public function __construct(WorkflowRepository $repository, WorkflowValidator $validator)
    {
        $this->repository = $repository;
        $this->validator = $validator;
        $this->resource = WorkflowResource::class;
    }

}
