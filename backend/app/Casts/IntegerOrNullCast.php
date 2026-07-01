<?php

namespace App\Casts;

use Illuminate\Contracts\Database\Eloquent\CastsAttributes;

class IntegerOrNullCast implements CastsAttributes
{
    public function get($model, $key, $value, $attributes)
    {
        if (empty($value)) {
            return null;
        }

        return (int) $value;
    }

    public function set($model, $key, $value, $attributes)
    {
        return $value;
    }
}
