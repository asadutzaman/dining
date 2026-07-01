<?php

namespace App\Casts;

use Illuminate\Contracts\Database\Eloquent\CastsInboundAttributes;
use Illuminate\Support\Str;

class LimitCaster implements CastsInboundAttributes
{
    public function __construct($length = 25)
    {
        $this->length = $length;
    }

    public function set($model, $key, $value, $attributes)
    {
        return [$key => Str::limit((string) $value, $this->length)];
    }
}
