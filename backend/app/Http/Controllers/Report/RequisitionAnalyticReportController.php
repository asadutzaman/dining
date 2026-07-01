<?php

namespace App\Http\Controllers\Report;

use Exception;
use Maatwebsite\Excel\Facades\Excel;
use App\Http\Controllers\Controller;
use App\Exceptions\ValidatorException;
use App\Exports\RequisitionAnalyticReportExport;
use App\Http\Resources\Report\RequisitionAnalyticReportResource;
use App\Traits\Controller\RestControllerTrait;
use App\Repositories\Report\RequisitionAnalyticReportRepository;

class RequisitionAnalyticReportController extends Controller
{
    use RestControllerTrait;

    private $repository;
    private $validator;
    private $resource;
    private $ItemStockReportRepository;
    private $ItemStockRepository;


    public function __construct(RequisitionAnalyticReportRepository $repository)
    {
        $this->repository = $repository;
        $this->resource = RequisitionAnalyticReportResource::class;
    }

    public function getRequisitionAnalytic()
    {
        try {
            $result = ($this->repository->init())->getRequisitionAnalyticList();
            $result['results'] = isset($this->resource) ? $this->resource::collection($result['results']) : $result['results'];
            return $this->successResourceResponse($result);
        } catch (Exception $e) {
            $this->errorResponse($e->getMessage());
        }
    }

    public function getRequisitionAnalyticExport()
    {
        ini_set('max_execution_time', 0);
        ini_set('memory_limit', '-1');
        return Excel::download(new RequisitionAnalyticReportExport, 'requisitionAnalyticReport.xlsx', \Maatwebsite\Excel\Excel::XLSX);
    }
}
