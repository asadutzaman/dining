<?php

namespace App\Http\Controllers;

use App\Http\Resources\WorkspaceResource;
use App\Repositories\WorkspaceRepository;
use App\Traits\Controller\RestControllerTrait;
use App\Validators\WorkspaceValidator;

class WorkspaceController extends Controller
{
    private $repository;

    private $validator;

    private $resource;

    private $partialUpdateFields = ['name', 'status'];

    use RestControllerTrait;

    public function __construct(WorkspaceRepository $repository, WorkspaceValidator $validator)
    {
        // $this->middleware('auth.token', ['except' => ['store']]);
        $this->repository = $repository;
        $this->validator = $validator;
        $this->resource = WorkspaceResource::class;
    }

}
