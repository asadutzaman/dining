<?php

namespace App\Casts;

use Illuminate\Contracts\Database\Eloquent\CastsAttributes;

class EncryptCast implements CastsAttributes
{
    /**
     * get
     *
     * @param  mixed $model
     * @param  mixed $key
     * @param  mixed $value
     * @param  mixed $attributes
     *
     * @return void
     */
    public function get($model, $key, $value, $attributes)
    {
        return [$key => decrypt($value)];
    }

    /**
     * set
     *
     * @param  mixed $model
     * @param  mixed $key
     * @param  mixed $value
     * @param  mixed $attributes
     *
     * @return void
     */
    public function set($model, $key, $value, $attributes)
    {
        return encrypt($value);
    }
}
