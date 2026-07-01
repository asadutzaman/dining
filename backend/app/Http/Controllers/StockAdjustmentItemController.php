<?php

namespace App\Http\Controllers;

use App\Http\Resources\StockAdjustmentItemResource;
use App\Repositories\StockAdjustmentItemRepository;
use App\Traits\Controller\RestControllerTrait;
use App\Validators\StockAdjustmentItemValidator;

class StockAdjustmentItemController extends Controller
{
    private $repository;

    private $validator;

    private $resource;

    private $partialUpdateFields = ['status'];

    use RestControllerTrait;

    public function __construct(StockAdjustmentItemRepository $repository, StockAdjustmentItemValidator $validator)
    {
        $this->repository = $repository;
        $this->validator = $validator;
        $this->resource = StockAdjustmentItemResource::class;
    }

}
