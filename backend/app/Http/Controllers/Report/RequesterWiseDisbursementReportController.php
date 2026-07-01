<?php

namespace App\Http\Controllers\Report;

use App\Http\Controllers\Controller;
use App\Validators\RequesterWiseDisbursementReportValidator;
use App\Repositories\Report\RequesterWiseDisbursementReportRepository;
use App\Http\Resources\Report\RequesterWiseDisbursementReportResource;
use App\Traits\Controller\RestControllerTrait;
use Exception;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\RequesterWiseDisbursementReportExport;


class RequesterWiseDisbursementReportController extends Controller
{
    private $repository;
    // private $validator;
    private $resource;
    use RestControllerTrait;

    public function __construct(RequesterWiseDisbursementReportRepository $repository/* , RequesterWiseDisbursementReportValidator $validator */)
    {
        $this->repository = $repository;
        // $this->validator = $validator;
        $this->resource = RequesterWiseDisbursementReportResource::class;
    }

    public function getRequesterWiseDisbursementList()
    {
        try {
            $result = ($this->repository->init())->getRequesterWiseDisbursementList();
            $result['results'] = isset($this->resource) ? $this->resource::collection($result['results']) : $result['results'];
            return $this->successResourceResponse($result);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage());
        }
    }

    public function getRequesterWiseDisbursementExport()
    {
        ini_set('max_execution_time', 0);
        ini_set('memory_limit', '-1');
        return Excel::download(new RequesterWiseDisbursementReportExport, 'RequesterWiseDisbursementReport.xlsx', \Maatwebsite\Excel\Excel::XLSX);
    }
}
