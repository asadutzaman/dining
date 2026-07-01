<?php

namespace App\Enums;

use Illuminate\Support\Collection;

enum ItemTypeEnum: string
{
    case CONSUMABLE     = 'CONSUMABLE';
    case NON_CONSUMABLE = 'NON_CONSUMABLE';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public static function toSelect(): Collection
    {
        return collect(self::cases())->map(fn($case) => [
            'label' => ucfirst($case->value),
            'value' => $case->value
        ]);
    }
}
