<?php

namespace App\Exports;

use App\Http\Resources\Report\JobCostingReportResource;
use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;
use App\Repositories\Report\JobCostingReportRepository;
use App\Services\ResourceService;

class JobCostingReportExport implements FromView
{

    public function view(): View
    {
        $repository = (new JobCostingReportRepository())->init();
        $result = $repository->getJobCostingListExport();
        $resultResource = ResourceService::getResourceCollection($result['results'], JobCostingReportResource::class);

        $response = [
            'results' => $resultResource,
            'jobOrderInfo' => $result['jobOrderInfo'],
            'consumptionItemList' => $result['consumptionItemList'],
            'transferredMaterialList' => $result['transferredMaterialList'],
            'consumptionProjectOverheadList' => $result['consumptionProjectOverheadList'],
        ];
        return view('reports.scm.jobCosting.jobCostingList', $response);
    }
}
