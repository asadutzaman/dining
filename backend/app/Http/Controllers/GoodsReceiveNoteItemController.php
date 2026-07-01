<?php

namespace App\Http\Controllers;

use App\Http\Resources\GoodsReceiveNoteItemResource;
use App\Repositories\GoodsReceiveNoteItemRepository;
use App\Traits\Controller\RestControllerTrait;
use App\Validators\GoodsReceiveNoteItemValidator;

class GoodsReceiveNoteItemController extends Controller
{
    private $repository;

    private $validator;

    private $resource;

    private $partialUpdateFields = ['status'];

    use RestControllerTrait;

    public function __construct(GoodsReceiveNoteItemRepository $repository, GoodsReceiveNoteItemValidator $validator)
    {
        $this->repository = $repository;
        $this->validator = $validator;
        $this->resource = GoodsReceiveNoteItemResource::class;
    }

}
