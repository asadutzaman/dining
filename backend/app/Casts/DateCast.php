<?php

namespace App\Casts;

use Carbon\Carbon;
use Illuminate\Contracts\Database\Eloquent\CastsAttributes;

class DateCast implements CastsAttributes
{
    public function get($model, $key, $value, $attributes)
    {
        $value = Carbon::parse($value);

        return [
            "day" => $value->day,
            "month" => $value->month,
            "year" => $value->year,
        ];
    }

    public function set($model, $key, $value, $attributes)
    {
        $value = Carbon::createFromDate($value["year"], $value["month"], $value["day"]);
        return $value;
    }
}
