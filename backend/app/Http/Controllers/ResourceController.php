<?php

namespace App\Http\Controllers;

use App\Http\Resources\ResourceResource;
use App\Repositories\ResourceRepository;
use App\Traits\Controller\RestControllerTrait;
use App\Validators\ResourceValidator;

class ResourceController extends Controller
{
    private $repository;

    private $validator;

    private $resource;

    private $partialUpdateFields = ['name', 'status'];

    use RestControllerTrait;

    public function __construct(ResourceRepository $repository, ResourceValidator $validator)
    {
        $this->repository = $repository;
        $this->validator = $validator;
        $this->resource = ResourceResource::class;
    }
}
