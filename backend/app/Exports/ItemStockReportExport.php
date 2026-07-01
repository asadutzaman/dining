<?php

namespace App\Exports;

use App\Http\Resources\Report\ItemStockReportResource;
use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;
use App\Repositories\Report\ItemStockReportRepository;
use App\Services\ResourceService;
use Illuminate\Support\Facades\Log;

class ItemStockReportExport implements FromView
{

    protected $repository;

    public function view(): View
    {
        $repository = (new ItemStockReportRepository())->init();
        $result = $repository->getItemStockListExport();
        $resultResource = ResourceService::getResourceCollection($result['results'], ItemStockReportResource::class);

        $response = [
            'results' => $resultResource,
        ];
        return view('reports.inventory.itemStock.itemStockList', $response);
    }
}
