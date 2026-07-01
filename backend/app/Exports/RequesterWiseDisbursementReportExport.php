<?php

namespace App\Exports;

use App\Services\ResourceService;
use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;
use App\Repositories\Report\RequesterWiseDisbursementReportRepository;
use App\Http\Resources\Report\RequesterWiseDisbursementReportResource;

class RequesterWiseDisbursementReportExport implements FromView
{
    public function view(): View
    {
        $repository = (new RequesterWiseDisbursementReportRepository())->init();
        $result = $repository->getRequesterWiseDisbursementExport();
        $resultResource = ResourceService::getResourceCollection($result['results'], RequesterWiseDisbursementReportResource::class);

        $response = [
            'results' => $resultResource,
            'requesterInfo' => $result['requesterInfo'] ?? null,
        ];

        return view('reports.inventory.requesterWiseDisbursement.requesterWiseDisbursement', $response);
    }
}
