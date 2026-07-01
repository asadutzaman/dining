<?php

namespace App\Http\Controllers;

use App\Http\Resources\RequestAccessResource;
use App\Repositories\RequestAccessRepository;
use App\Traits\Controller\RestControllerTrait;
use App\Validators\RequestAccessValidator;

class RequestAccessController extends Controller
{
    private $repository;

    private $validator;

    private $resource;

    private $partialUpdateFields = ['first_name', 'email', 'phone', 'device_id', 'identifier'];

    use RestControllerTrait;

    public function __construct(RequestAccessRepository $repository, RequestAccessValidator $validator)
    {
        $this->repository = $repository;
        $this->validator = $validator;
        $this->resource = RequestAccessResource::class;
    }

}
