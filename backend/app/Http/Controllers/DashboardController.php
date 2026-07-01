<?php

namespace App\Http\Controllers;

use Exception;
use App\Http\Controllers\Controller;
use App\Exceptions\ValidatorException;
use App\Repositories\DashboardRepository;
use App\Http\Resources\DashboardResource;
use App\Traits\Controller\RestControllerTrait;
use App\Repositories\RequisitionRepository;
use App\Repositories\GoodsReceiveNoteRepository;
use App\Repositories\StockAdjustmentRepository;



class DashboardController extends Controller
{
    private $repository;
    private $validator;
    private $resource;
    use RestControllerTrait;
    private $requisitionRepository;
    private $goodsReceiveNoteRepository;
    private $stockAdjustmentRepository;

    // private $partialUpdateFields = ['status'];


    public function __construct(DashboardRepository $repository, RequisitionRepository $requisitionRepository, GoodsReceivenoteRepository $goodsReceiveNoteRepository, StockAdjustmentRepository $stockAdjustmentRepository)
    {
        $this->repository = $repository;
        $this->resource = DashboardResource::class;
        $this->requisitionRepository = $requisitionRepository;
        $this->goodsReceiveNoteRepository = $goodsReceiveNoteRepository;
        $this->stockAdjustmentRepository = $stockAdjustmentRepository;
    }

    public function getDashboardStats()
    {
        try {
            $result = ($this->repository->init())->dashboardStats();
            return $this->successResponse($result);
        } catch (Exception $e) {
            $this->errorResponse($e->getMessage());
        }
    }
}
