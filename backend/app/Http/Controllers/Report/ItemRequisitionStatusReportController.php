<?php

namespace App\Http\Controllers\Report;

use Exception;
use Maatwebsite\Excel\Facades\Excel;
use App\Http\Controllers\Controller;
use App\Exceptions\ValidatorException;
use App\Exports\ItemRequisitionStatusReportExport;
use App\Validators\ItemRequisitionStatusReportValidator;
use App\Repositories\Report\ItemRequisitionStatusReportRepository;
use App\Http\Resources\Report\ItemRequisitionStatusReportResource;
use App\Traits\Controller\RestControllerTrait;
use App\Repositories\ItemRepository;



class ItemRequisitionStatusReportController extends Controller
{
    use RestControllerTrait;

    private $repository;
    private $validator;
    private $resource;
    private $itemRepository;


    public function __construct(ItemRequisitionStatusReportRepository $repository, ItemRequisitionStatusReportValidator $validator, ItemRepository $itemRepository)
    {
        $this->repository = $repository;
        $this->validator = $validator;
        $this->resource = ItemRequisitionStatusReportResource::class;
        $this->itemRepository = $itemRepository;
    }

    public function getItemRequisitionStatusReportList()
    {
        try {
            $result = ($this->repository->init())->getItemRequisitionStatusReportList();
            // return $result;
            $result['results'] = isset($this->resource) ? $this->resource::collection($result['results']) : $result['results'];
            return $this->successResourceResponse($result);
        } catch (Exception $e) {
            $this->errorResponse($e->getMessage());
        }
    }

    public function getItemRequisitionStatusReportExport()
    {
        ini_set('max_execution_time', 0);
        ini_set('memory_limit', '-1');
        return Excel::download(new ItemRequisitionStatusReportExport, 'itemRequisitionStatusReport.xlsx', \Maatwebsite\Excel\Excel::XLSX);
    }
}
