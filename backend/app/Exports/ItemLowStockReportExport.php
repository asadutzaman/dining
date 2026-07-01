<?php

namespace App\Exports;

use App\Services\ResourceService;
use Illuminate\Support\Facades\Log;
use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;
use App\Repositories\Report\ItemLowStockReportRepository;
use App\Http\Resources\Report\ItemLowStockReportResource;

class ItemLowStockReportExport implements FromView
{

    protected $repository;



    public function view(): View
    {
        $repository = (new ItemLowStockReportRepository())->init();
        $result = $repository->getItemLowStockExport();
        $resultResource = ResourceService::getResourceCollection($result['results'], ItemLowStockReportResource::class);

        $response = [

            'results' => $resultResource,
        ];
        return view('reports.inventory.itemLowStock.itemLowStock', $response);
    }
}
