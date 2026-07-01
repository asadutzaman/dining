<?php

namespace App\Http\Controllers;

use App\Http\Resources\ScopeResource;
use App\Repositories\ScopeRepository;
use App\Traits\Controller\RestControllerTrait;
use App\Validators\ScopeValidator;

class ScopeController extends Controller
{
    private $repository;

    private $validator;

    private $resource;

    private $partialUpdateFields = ['name', 'status'];

    use RestControllerTrait;

    public function __construct(ScopeRepository $repository, ScopeValidator $validator)
    {
        $this->repository = $repository;
        $this->validator = $validator;
        $this->resource = ScopeResource::class;
    }
}
