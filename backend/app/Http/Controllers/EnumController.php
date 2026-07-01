<?php

namespace App\Http\Controllers;

use App\Validators\EnumValidator;
use App\Repositories\EnumRepository;
use App\Http\Resources\EnumResource;
use App\Traits\Controller\RestControllerTrait;

class EnumController extends Controller
{
    private $repository;

    private $validator;

    private $resource;

    private $partialUpdateFields = ['status'];

    use RestControllerTrait;

    public function __construct(EnumRepository $repository, EnumValidator $validator)
    {
        $this->repository = $repository;
        $this->validator = $validator;
        $this->resource = EnumResource::class;
    }

}
