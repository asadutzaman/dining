<?php

namespace App\Http\Controllers;

use App\Http\Resources\AppsResource;
use App\Repositories\AppsRepository;
use App\Traits\Controller\RestControllerTrait;
use App\Validators\AppsValidator;

class AppsController extends Controller
{
    private $repository;

    private $validator;

    private $resource;

    private $partialUpdateFields = ['name', 'status'];

    use RestControllerTrait;

    public function __construct(AppsRepository $repository, AppsValidator $validator)
    {
        $this->repository = $repository;
        $this->validator = $validator;
        $this->resource = AppsResource::class;
    }

}
