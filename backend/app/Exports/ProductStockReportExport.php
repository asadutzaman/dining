<?php

namespace App\Exports;

use App\Http\Resources\Report\ProductStockReportResource;
use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;
use App\Repositories\Report\ProductStockReportRepository;
use App\Services\ResourceService;

class ProductStockReportExport implements FromView
{

    public function view(): View
    {
        $repository = (new ProductStockReportRepository())->init();
        $result = $repository->getProductStockListExport();
        $resultResource = ResourceService::getResourceCollection($result['results'], ProductStockReportResource::class);

        $response = [
            'results' => $resultResource,
            'jobOrderInfo' => $result['jobOrderInfo'],
        ];
        return view('reports.inv.productStock.productStockList', $response);
    }
}
