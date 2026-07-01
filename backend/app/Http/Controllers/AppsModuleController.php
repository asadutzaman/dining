<?php

namespace App\Http\Controllers;

use App\Http\Resources\AppsModuleResource;
use App\Repositories\AppsModuleRepository;
use App\Traits\Controller\RestControllerTrait;
use App\Validators\AppsModuleValidator;

class AppsModuleController extends Controller
{
    private $repository;

    private $validator;

    private $resource;

    private $partialUpdateFields = ['name', 'status'];

    use RestControllerTrait;

    public function __construct(AppsModuleRepository $repository, AppsModuleValidator $validator)
    {
        $this->repository = $repository;
        $this->validator = $validator;
        $this->resource = AppsModuleResource::class;
    }

}
