<?php

namespace App\Exports;

use App\Services\ResourceService;
use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;
use App\Repositories\Report\ThanaWiseDisbursementReportRepository;
use App\Http\Resources\Report\ThanaWiseDisbursementReportResource;

class ThanaWiseDisbursementReportExport implements FromView
{
    public function view(): View
    {
        $repository = (new ThanaWiseDisbursementReportRepository())->init();
        $result = $repository->getThanaWiseDisbursementExport();
        $resultResource = ResourceService::getResourceCollection($result['results'], ThanaWiseDisbursementReportResource::class);

        $response = [
            'results' => $resultResource,
            'branchInfo' => $result['branchInfo'] ?? null,
        ];

        return view('reports.inventory.thanaWiseDisbursement.thanaWiseDisbursement', $response);
    }
}
