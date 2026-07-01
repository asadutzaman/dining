<?php

namespace App\Exports;

use App\Repositories\Report\DiningReportRepository;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class DiningMealCostReportExport implements FromCollection, WithHeadings, WithMapping
{
    protected $from;
    protected $to;

    public function __construct($from, $to)
    {
        $this->from = $from;
        $this->to = $to;
    }

    public function collection()
    {
        return (new DiningReportRepository())->init()->getMealCostSummary($this->from, $this->to);
    }

    public function headings(): array
    {
        return [
            'Meal Date',
            'Meal Type',
            'Tokens Issued',
            'Total Amount',
            'Paid Amount',
            'Due Amount',
        ];
    }

    public function map($row): array
    {
        return [
            $row->meal_date->format('Y-m-d'),
            $row->meal_type,
            $row->tokens_count,
            $row->total_amount,
            $row->paid_amount,
            $row->due_amount,
        ];
    }
}
