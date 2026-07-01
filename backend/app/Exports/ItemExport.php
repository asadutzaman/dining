<?php

namespace App\Exports;

use App\Models\Children;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithCustomStartCell;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\ToModel;

use Maatwebsite\Excel\Imports\HeadingRowFormatter;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Maatwebsite\Excel\Concerns\WithMapping;
// HeadingRowFormatter::default('none');

class ItemExport implements FromCollection, WithHeadings, WithCustomStartCell, WithStyles, WithMapping
{
    protected $data;
    protected $header;

    public function __construct($data, $header = [])
    {
        $this->data = $data;
        $this->header = $header;
    }
    /**
     * @return \Illuminate\Support\Collection
     */
    public function collection()
    {
        return $this->data;
    }

    public function startCell(): string
    {
        return 'A1';
    }

    public function headings(): array
    {
        return $this->header;
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1    => ['font' => ['bold' => true]],
        ];
    }

    public function map($data): array
    {
        $deciplineName = $itemCategoryName = $itemGroupName = $itemSpecificationName = $brandName = $unitShortName = $countryName = $colorName = null;
        if (isset($data->decipline)) {
            $deciplineName = $data->decipline->name ?? '';
        }
        if (isset($data->itemCategory)) {
            $itemCategoryName = $data->itemCategory->name ?? '';
        }
        if (isset($data->itemGroup)) {
            $itemGroupName = $data->itemGroup->name ?? '';
        }
        if (isset($data->itemSpecification)) {
            $itemSpecificationName = $data->itemSpecification->name ?? '';
        }
        if (isset($data->brand)) {
            $brandName = $data->brand->name ?? '';
        }
        if (isset($data->unit)) {
            $unitShortName = $data->unit->short_name ?? '';
        }
        if (isset($data->country)) {
            $countryName = $data->country->name ?? '';
        }
        if (isset($data->color)) {
            $colorName = $data->color->name ?? '';
        }

        return [
            $data['code'] ?? null,
            $data['item_name'] ?? null,
            $deciplineName,
            $itemCategoryName,
            $itemGroupName,
            $itemSpecificationName,
            $brandName,
            $countryName,
            $unitShortName,
            $colorName,
            $data['description'] ?? null,
        ];
    }
}
