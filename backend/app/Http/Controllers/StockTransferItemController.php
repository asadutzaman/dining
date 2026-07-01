<?php

namespace App\Http\Controllers;

use App\Http\Resources\StockTransferItemResource;
use App\Repositories\StockTransferItemRepository;
use App\Traits\Controller\RestControllerTrait;
use App\Validators\StockTransferItemValidator;

class StockTransferItemController extends Controller
{
    private $repository;

    private $validator;

    private $resource;

    private $partialUpdateFields = ['status'];

    use RestControllerTrait;

    public function __construct(StockTransferItemRepository $repository, StockTransferItemValidator $validator)
    {
        $this->repository = $repository;
        $this->validator = $validator;
        $this->resource = StockTransferItemResource::class;
    }

}
