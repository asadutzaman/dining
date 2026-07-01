<?php

namespace App\Http\Controllers\Report;

use Exception;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use App\Http\Controllers\Controller;
use App\Repositories\Report\DiningReportRepository;
use App\Exports\DiningMonthlyReportExport;
use App\Exports\DiningMealCostReportExport;
use App\Exports\DiningIndividualReportExport;
use App\Traits\Controller\RestControllerTrait;

class DiningReportController extends Controller
{
    use RestControllerTrait;

    private $repository;

    public function __construct(DiningReportRepository $repository)
    {
        $this->repository = $repository;
    }

    public function getMonthlySummary(Request $request)
    {
        try {
            $year = $request->query('year') ?? now()->format('Y');
            $month = $request->query('month') ?? now()->format('m');

            $results = ($this->repository->init())->getMonthlySummary($year, $month);
            return $this->successResponse(['results' => $results]);
        } catch (Exception $e) {
            $this->errorResponse($e->getMessage());
        }
    }

    public function getMonthlySummaryExport(Request $request)
    {
        ini_set('max_execution_time', 0);
        ini_set('memory_limit', '-1');
        $year = $request->query('year') ?? now()->format('Y');
        $month = $request->query('month') ?? now()->format('m');
        return Excel::download(new DiningMonthlyReportExport($year, $month), 'dining-monthly-report.xlsx', \Maatwebsite\Excel\Excel::XLSX);
    }

    public function getIndividualStatement(Request $request)
    {
        try {
            $memberId = $request->query('member_id');
            if (empty($memberId)) {
                $this->errorResponse('Member is required!');
            }
            $from = $request->query('from') ?? now()->startOfMonth()->format('Y-m-d');
            $to = $request->query('to') ?? now()->format('Y-m-d');

            $result = ($this->repository->init())->getIndividualStatement($memberId, $from, $to);
            return $this->successResponse($result);
        } catch (Exception $e) {
            $this->errorResponse($e->getMessage());
        }
    }

    public function getIndividualStatementExport(Request $request)
    {
        ini_set('max_execution_time', 0);
        ini_set('memory_limit', '-1');
        $memberId = $request->query('member_id');
        $from = $request->query('from') ?? now()->startOfMonth()->format('Y-m-d');
        $to = $request->query('to') ?? now()->format('Y-m-d');
        return Excel::download(new DiningIndividualReportExport($memberId, $from, $to), 'dining-individual-statement.xlsx', \Maatwebsite\Excel\Excel::XLSX);
    }

    public function getMealCostSummary(Request $request)
    {
        try {
            $from = $request->query('from') ?? now()->startOfMonth()->format('Y-m-d');
            $to = $request->query('to') ?? now()->format('Y-m-d');

            $results = ($this->repository->init())->getMealCostSummary($from, $to);
            return $this->successResponse(['results' => $results]);
        } catch (Exception $e) {
            $this->errorResponse($e->getMessage());
        }
    }

    public function getMealCostSummaryExport(Request $request)
    {
        ini_set('max_execution_time', 0);
        ini_set('memory_limit', '-1');
        $from = $request->query('from') ?? now()->startOfMonth()->format('Y-m-d');
        $to = $request->query('to') ?? now()->format('Y-m-d');
        return Excel::download(new DiningMealCostReportExport($from, $to), 'dining-meal-cost-report.xlsx', \Maatwebsite\Excel\Excel::XLSX);
    }
}
