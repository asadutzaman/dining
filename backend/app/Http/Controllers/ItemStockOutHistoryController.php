<?php

namespace App\Http\Controllers;

use App\Http\Resources\ItemStockOutHistoryResource;
use App\Repositories\ItemStockOutHistoryRepository;
use App\Traits\Controller\RestControllerTrait;
use App\Validators\ItemStockOutHistoryValidator;

class ItemStockOutHistoryController extends Controller
{
    private $repository;

    private $validator;

    private $resource;

    private $partialUpdateFields = ['status'];

    use RestControllerTrait;

    public function __construct(ItemStockOutHistoryRepository $repository, ItemStockOutHistoryValidator $validator)
    {
        $this->repository = $repository;
        $this->validator = $validator;
        $this->resource = ItemStockOutHistoryResource::class;
    }
}
