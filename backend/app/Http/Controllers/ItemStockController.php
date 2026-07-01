<?php

namespace App\Http\Controllers;

use App\Http\Resources\ItemStockResource;
use App\Repositories\ItemStockRepository;
use App\Traits\Controller\RestControllerTrait;
use App\Validators\ItemStockValidator;

class ItemStockController extends Controller
{
    private $repository;

    private $validator;

    private $resource;

    private $partialUpdateFields = ['status'];

    use RestControllerTrait;

    public function __construct(ItemStockRepository $repository, ItemStockValidator $validator)
    {
        $this->repository = $repository;
        $this->validator = $validator;
        $this->resource = ItemStockResource::class;
    }

}
