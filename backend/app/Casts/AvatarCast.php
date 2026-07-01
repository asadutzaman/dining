<?php

namespace App\Casts;

use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Support\Facades\Storage;

class AvatarCast implements CastsAttributes
{
    public function get($model, string $key, $value, array $attributes)
    {
        if ($value == '') {
            return asset('assets/images/avatar.jpg');
        }
        return Storage::url($value);
    }

    public function set($model, string $key, $value, array $attributes)
    {
        return $value;
    }
}
