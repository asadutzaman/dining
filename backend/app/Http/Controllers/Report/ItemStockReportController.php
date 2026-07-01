<?php

namespace App\Http\Controllers\Report;

use Exception;
use Maatwebsite\Excel\Facades\Excel;
use App\Http\Controllers\Controller;
use App\Exceptions\ValidatorException;
use App\Exports\ItemStockReportExport;
use App\Validators\ItemStockReportValidator;
use App\Repositories\Report\ItemStockReportRepository;
use App\Http\Resources\Report\ItemStockReportResource;
use App\Traits\Controller\RestControllerTrait;
use App\Repositories\ItemStockRepository;


class ItemStockReportController extends Controller
{
    use RestControllerTrait;

    private $repository;
    private $validator;
    private $resource;
    private $ItemStockReportRepository;
    private $ItemStockRepository;


    public function __construct(ItemStockReportRepository $repository, ItemStockReportValidator $validator, ItemStockRepository $ItemStockRepository)
    {
        $this->repository = $repository;
        $this->validator = $validator;
        $this->resource = ItemStockReportResource::class;
        $this->ItemStockRepository = $ItemStockRepository;
    }

    public function getItemStockList()
    {
        try {
            $result = ($this->repository->init())->getItemLifecycleStockReport();
            // return $result;
            $result['results'] = isset($this->resource) ? $this->resource::collection($result['results']) : $result['results'];
            return $this->successResourceResponse($result);
        } catch (Exception $e) {
            $this->errorResponse($e->getMessage());
        }
    }

    public function getItemStockExport()
    {
        ini_set('max_execution_time', 0);
        ini_set('memory_limit', '-1');
        return Excel::download(new ItemStockReportExport, 'itemStockReport.xlsx', \Maatwebsite\Excel\Excel::XLSX);
    }

    public function getItemLifecycleStockReport()
    {
        try {
            $result = ($this->repository->init())->getItemLifecycleStockReport();
            return $this->successResourceResponse($result);
        } catch (Exception $e) {
            $this->errorResponse($e->getMessage());
        }
    }
}
