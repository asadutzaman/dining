<?php

namespace App\Http\Controllers;

use App\Validators\DisbursementSlotAssignValidator;
use App\Repositories\DisbursementSlotAssignRepository;
use App\Http\Resources\DisbursementSlotAssignResource;
use App\Traits\Controller\RestControllerTrait;

class DisbursementSlotAssignController extends Controller
{
    private $repository;

    private $validator;

    private $resource;

    private $partialUpdateFields = ['status'];

    use RestControllerTrait;

    public function __construct(DisbursementSlotAssignRepository $repository, DisbursementSlotAssignValidator $validator)
    {
        $this->repository = $repository;
        $this->validator = $validator;
        $this->resource = DisbursementSlotAssignResource::class;
    }
}
