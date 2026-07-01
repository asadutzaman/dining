<?php

namespace App\Http\Controllers;

use App\Http\Resources\RequisitionItemResource;
use App\Repositories\RequisitionItemRepository;
use App\Traits\Controller\RestControllerTrait;
use App\Validators\RequisitionItemValidator;

class RequisitionItemController extends Controller
{
    private $repository;

    private $validator;

    private $resource;

    private $partialUpdateFields = ['status'];

    use RestControllerTrait;

    public function __construct(RequisitionItemRepository $repository, RequisitionItemValidator $validator)
    {
        $this->repository = $repository;
        $this->validator = $validator;
        $this->resource = RequisitionItemResource::class;
    }
}
