<?php

namespace App\Http\Controllers\Report;

use Exception;
use Maatwebsite\Excel\Facades\Excel;
use App\Http\Controllers\Controller;
use App\Exceptions\ValidatorException;
use App\Exports\ItemLowStockReportExport;
use App\Validators\ItemLowStockReportValidator;
use App\Repositories\Report\ItemLowStockReportRepository;
use App\Http\Resources\Report\ItemLowStockReportResource;
use App\Traits\Controller\RestControllerTrait;
use App\Repositories\ItemRepository;
use App\Repositories\ItemStockRepository;


class ItemLowStockReportController extends Controller
{
    use RestControllerTrait;

    private $repository;
    private $validator;
    private $resource;
    private $ItemStockRepository;
    private $ItemRepository;
    private $ItemLowStockReportRepository;


    public function __construct(ItemLowStockReportRepository $repository, ItemLowStockReportValidator $validator, ItemStockRepository $ItemStockRepository, ItemRepository $ItemRepository)
    {
        $this->repository = $repository;
        $this->validator = $validator;
        $this->resource = ItemLowStockReportResource::class;
        $this->ItemStockRepository = $ItemStockRepository;
        $this->ItemRepository = $ItemRepository;
    }

    public function getItemLowStocktList()
    {
        try {
            $result = ($this->repository->init())->getDemandVsStock();
            // return $result;
            $result['results'] = isset($this->resource) ? $this->resource::collection($result['results']) : $result['results'];
            return $this->successResourceResponse($result);
        } catch (Exception $e) {
            $this->errorResponse($e->getMessage());
        }
    }

    public function getItemLowStockExport()
    {
        ini_set('max_execution_time', 0);
        ini_set('memory_limit', '-1');
        return Excel::download(new ItemLowStockReportExport, 'itemLowStockReport.xlsx', \Maatwebsite\Excel\Excel::XLSX);
    }
}
