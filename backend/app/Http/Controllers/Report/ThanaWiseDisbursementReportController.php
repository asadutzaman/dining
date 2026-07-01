<?php

namespace App\Http\Controllers\Report;

use App\Http\Controllers\Controller;
use App\Validators\ThanaWiseDisbursementReportValidator;
use App\Repositories\Report\ThanaWiseDisbursementReportRepository;
use App\Http\Resources\Report\ThanaWiseDisbursementReportResource;
use App\Traits\Controller\RestControllerTrait;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\ThanaWiseDisbursementReportExport;



class ThanaWiseDisbursementReportController extends Controller
{
    private $repository;
    private $resource;
    use RestControllerTrait;

    public function __construct(ThanaWiseDisbursementReportRepository $repository)
    {
        $this->repository = $repository;
        $this->resource = ThanaWiseDisbursementReportResource::class;
    }

    public function getThanaWiseDisbursementList()
    {
        try {
            $result = ($this->repository->init())->getThanaWiseDisbursementList();
            $result['results'] = isset($this->resource) ? $this->resource::collection($result['results']) : $result['results'];
            return $this->successResourceResponse($result);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage());
        }
    }

    public function getThanaWiseDisbursementExport()
    {
        ini_set('max_execution_time', 0);
        ini_set('memory_limit', '-1');
        return Excel::download(new ThanaWiseDisbursementReportExport, 'ThanaWiseDisbursementReport.xlsx', \Maatwebsite\Excel\Excel::XLSX);
    }
}
