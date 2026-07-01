<?php

namespace App\Exports;

use App\Repositories\Report\DiningReportRepository;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class DiningMonthlyReportExport implements FromCollection, WithHeadings, WithMapping
{
    protected $year;
    protected $month;

    public function __construct($year, $month)
    {
        $this->year = $year;
        $this->month = $month;
    }

    public function collection()
    {
        return (new DiningReportRepository())->init()->getMonthlySummary($this->year, $this->month);
    }

    public function headings(): array
    {
        return [
            'Member Code',
            'Member Name',
            'Member Type',
            'Tokens Issued',
            'Total Amount',
            'Paid Amount',
            'Due Amount',
            'Payments Collected',
            'Current Due Balance',
        ];
    }

    public function map($row): array
    {
        return [
            $row['member_code'],
            $row['member_name'],
            $row['member_type'],
            $row['tokens_count'],
            $row['total_amount'],
            $row['paid_amount'],
            $row['due_amount'],
            $row['payments_collected'],
            $row['current_due_balance'],
        ];
    }
}
