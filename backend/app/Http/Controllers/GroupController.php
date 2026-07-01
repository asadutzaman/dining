<?php

namespace App\Http\Controllers;

use App\Http\Resources\GroupResource;
use App\Repositories\GroupRepository;
use App\Traits\Controller\RestControllerTrait;
use App\Validators\GroupValidator;

class GroupController extends Controller
{
    private $repository;

    private $validator;

    private $resource;

    private $partialUpdateFields = ['name', 'status'];

    use RestControllerTrait;

    public function __construct(GroupRepository $repository, GroupValidator $validator)
    {
        $this->repository = $repository;
        $this->validator = $validator;
        $this->resource = GroupResource::class;
    }
}
