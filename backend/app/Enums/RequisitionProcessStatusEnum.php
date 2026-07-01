<?php

namespace App\Enums;

use Illuminate\Support\Collection;

enum RequisitionProcessStatusEnum: string
{
    case DRAFT       = 'DRAFT';
    case SUBMITTED   = 'SUBMITTED';

    public static function values(): array
    {
        // return array_column(self::cases(), 'value');
        return array_map(fn($case) => $case->value, self::cases());
    }

    public static function toSelect(): Collection
    {
        // return collect(self::cases())->map(fn($case) => [
        //     'label' => ucfirst($case->value),
        //     'value' => $case->value
        // ]);

        return collect(self::cases())->map(fn($case) => [
            'label' => ucfirst(strtolower($case->value)),
            'value' => $case->value
        ]);
    }
}
