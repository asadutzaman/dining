<?php

namespace App\Exports;

use App\Repositories\Report\DiningReportRepository;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class DiningIndividualReportExport implements FromCollection, WithHeadings, WithMapping
{
    protected $memberId;
    protected $from;
    protected $to;

    public function __construct($memberId, $from, $to)
    {
        $this->memberId = $memberId;
        $this->from = $from;
        $this->to = $to;
    }

    public function collection()
    {
        $result = (new DiningReportRepository())->init()->getIndividualStatement($this->memberId, $this->from, $this->to);
        return $result['entries'];
    }

    public function headings(): array
    {
        return [
            'Date',
            'Entry Type',
            'Description',
            'Due Added',
            'Paid Amount',
        ];
    }

    public function map($row): array
    {
        return [
            $row['date'],
            $row['entry_type'],
            $row['description'],
            $row['due_added'],
            $row['paid_amount'],
        ];
    }
}
