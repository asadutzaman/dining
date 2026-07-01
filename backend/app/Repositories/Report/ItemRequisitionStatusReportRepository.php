<?php

namespace App\Repositories\Report;

use App\Models\ItemRequisitionStatusReport;
use App\Services\ODataService;
use App\Repositories\BaseRepository;
use App\Repositories\BranchRepository;
use App\Repositories\RequisitionRepository;
use Illuminate\Support\Facades\Log;

class ItemRequisitionStatusReportRepository extends BaseRepository
{
    /**
     * @var ItemRequisitionStatusReport
     */
    protected $model;

    protected $request;

    protected $oDataService;

    protected $fieldSearchable = ['title', 'description'];

    // public function __construct()
    // {
    //     $this->model         = new ItemRequisitionStatusReport();
    // }
    public function init()
    {
        $this->request      = request();
        $this->oDataService = (new ODataService())->init();
        return $this;
    }

    public function getItemRequisitionStatusReportList()
    {
        $oDataParams = $this->oDataService->getFilterQueryParams();

        // GET TOTAL DMP UNITS/ THANAS
        $totalThana = (new BranchRepository())
            ->newQuery()
            ->get()
            ->count();

        $query = (new RequisitionRepository())
            ->newQuery()
            ->select('branch_id')
            // ->selectRaw('COUNT(*) as total_count')
            ->selectRaw("
                SUM(CASE
                    WHEN process_status != 'PENDING' THEN 1
                    ELSE 0
                END) as total_count
            ")
            ->selectRaw("
                SUM(CASE
                    WHEN process_status = 'SUBMITTED' THEN 1
                    ELSE 0
                END) as pending_count
            ")
            ->selectRaw("
                SUM(CASE
                    WHEN process_status IN ('APPROVED', 'DISBURSED', 'ACKNOWLEDGED') THEN 1
                    ELSE 0
                END) as approved_count
            ")
            ->selectRaw("
                SUM(CASE
                    WHEN process_status = 'REJECTED' THEN 1
                    ELSE 0
                END) as rejected_count
            ")
            ->selectRaw("
                SUM(CASE
                    WHEN process_status = 'DELAYED' THEN 1
                    ELSE 0
                END) as delayed_count
            ");
        // ->when(!empty($oDataParams['branch_id']), function ($query) use ($oDataParams['branch_id']) {
        //          $query->where('branch_id', $oDataParams['branch_id']);
        // });

        if (!empty($oDataParams['branch_id'])) {
            $query->where('branch_id', $oDataParams['branch_id']);
        }

        $requisitionStats = $query->with(['branchInfo:id,name'])
            ->groupBy('branch_id')
            ->get();

        $results = [
            'meta' => [],
            'results' => $requisitionStats,
        ];

        $responseData = [
            'meta' => $results['meta'],
            'results' => $results['results'],
            'totalThana' => $totalThana,
        ];
        return $responseData;
    }

    public function getItemRequisitionStatusReportExport()
    {
        $oDataParams = $this->oDataService->getFilterQueryParams();

        $query = (new RequisitionRepository())
            ->newQuery()
            ->select('branch_id')
            // ->selectRaw('COUNT(*) as total_count')
            ->selectRaw("
                SUM(CASE
                    WHEN process_status != 'PENDING' THEN 1
                    ELSE 0
                END) as total_count
            ")
            ->selectRaw("
                SUM(CASE
                    WHEN process_status = 'SUBMITTED' THEN 1
                    ELSE 0
                END) as pending_count
            ")
            ->selectRaw("
                SUM(CASE
                    WHEN process_status IN ('APPROVED', 'DISBURSED', 'ACKNOWLEDGED') THEN 1
                    ELSE 0
                END) as approved_count
            ")
            ->selectRaw("
                SUM(CASE
                    WHEN process_status = 'REJECTED' THEN 1
                    ELSE 0
                END) as rejected_count
            ")
            ->selectRaw("
                SUM(CASE
                    WHEN process_status = 'DELAYED' THEN 1
                    ELSE 0
                END) as delayed_count
            ");
        // ->when(!empty($oDataParams['branch_id']), function ($query) use ($oDataParams['branch_id']) {
        //          $query->where('branch_id', $oDataParams['branch_id']);
        // });

        if (!empty($oDataParams['branch_id'])) {
            $query->where('branch_id', $oDataParams['branch_id']);
        }

        $requisitionStats = $query->with(['branchInfo:id,name'])
            ->groupBy('branch_id')
            ->get();

        $results = [
            'meta' => [],
            'results' => $requisitionStats,
        ];

        $responseData = [
            // 'meta' => $results['meta'],
            'results' => $results['results'],
        ];
        return $responseData;
    }
}
