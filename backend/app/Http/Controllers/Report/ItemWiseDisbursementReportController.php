<?php

namespace App\Http\Controllers\Report;

use App\Http\Controllers\Controller;
use App\Repositories\Report\ItemWiseDisbursementReportRepository;
use App\Traits\Controller\RestControllerTrait;
use Exception;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\ItemWiseDisbursementReportExport;
use App\Http\Resources\Report\ItemWiseDisbursementReportResource;

class ItemWiseDisbursementReportController extends Controller
{
    private $repository;
    private $resource;
    use RestControllerTrait;

    public function __construct(ItemWiseDisbursementReportRepository $repository)
    {
        $this->repository = $repository;
        $this->resource = ItemWiseDisbursementReportResource::class;
    }

    public function getItemWiseDisbursementList()
    {
        try {
            $result = ($this->repository->init())->getItemWiseDisbursementList();
            $result['results'] = isset($this->resource) ? $this->resource::collection($result['results']) : $result['results'];
            return $this->successResourceResponse($result);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage());
        }
    }

    public function getItemWiseDisbursementExport()
    {
        ini_set('max_execution_time', 0);
        ini_set('memory_limit', '-1');
        return Excel::download(new ItemWiseDisbursementReportExport, 'ItemWiseDisbursementReport.xlsx', \Maatwebsite\Excel\Excel::XLSX);
    }
}
