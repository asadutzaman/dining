<?php

namespace App\Exports;

use App\Services\ResourceService;
use Illuminate\Support\Facades\Log;
use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;
use App\Repositories\Report\ItemRequisitionStatusReportRepository;
use App\Http\Resources\Report\ItemRequisitionStatusReportResource;

class ItemRequisitionStatusReportExport implements FromView
{

    protected $repository;

    public function view(): View
    {
        $repository = (new ItemRequisitionStatusReportRepository())->init();
        $result = $repository->getItemRequisitionStatusReportExport();
        $resultResource = ResourceService::getResourceCollection($result['results'], ItemRequisitionStatusReportResource::class);

        $response = [
            'results' => $resultResource,
        ];
        return view('reports.inventory.itemRequisitionStatus.itemRequisitionStatus', $response);
    }
}
