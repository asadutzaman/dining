<?php

namespace App\Exports;

use App\Services\ResourceService;
use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;
use App\Repositories\Report\ItemWiseDisbursementReportRepository;
use App\Http\Resources\Report\ItemWiseDisbursementReportResource;

class ItemWiseDisbursementReportExport implements FromView
{
    public function view(): View
    {
        $repository = (new ItemWiseDisbursementReportRepository())->init();
        $result = $repository->getItemWiseDisbursementExport();
        $resultResource = ResourceService::getResourceCollection($result['results'], ItemWiseDisbursementReportResource::class);

        $response = [
            'results' => $resultResource,
        ];

        return view('reports.inventory.itemWiseDisbursement.itemWiseDisbursement', $response);
    }
}
