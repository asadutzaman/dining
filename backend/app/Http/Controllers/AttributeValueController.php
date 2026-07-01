<?php

namespace App\Http\Controllers;

use App\Http\Resources\AttributeValueResource;
use App\Repositories\AttributeValueRepository;
use App\Traits\Controller\RestControllerTrait;
use App\Validators\AttributeValueValidator;

class AttributeValueController extends Controller
{
    private $repository;

    private $validator;

    private $resource;

    private $partialUpdateFields = ['status'];

    use RestControllerTrait;

    public function __construct(AttributeValueRepository $repository, AttributeValueValidator $validator)
    {
        $this->repository = $repository;
        $this->validator = $validator;
        $this->resource = AttributeValueResource::class;
    }
}
