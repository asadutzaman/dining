<?php

namespace App\Exports;

use App\Services\ResourceService;
use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;
use App\Repositories\Report\RequisitionAnalyticReportRepository;
use App\Http\Resources\Report\RequisitionAnalyticReportResource;

class RequisitionAnalyticReportExport implements FromView
{
    public function view(): View
    {
        $repository = (new RequisitionAnalyticReportRepository())->init();
        $result = $repository->getRequisitionAnalyticExport();
        $resultResource = ResourceService::getResourceCollection($result['results'], RequisitionAnalyticReportResource::class);

        $response = [
            'results' => $resultResource,
            'requesterInfo' => $result['requesterInfo'] ?? null,
        ];

        return view('reports.inventory.requisitionAnalytic.requisitionAnalytic', $response);
    }
}
