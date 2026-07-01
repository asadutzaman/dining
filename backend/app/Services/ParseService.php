<?php

namespace App\Services;

class ParseService
{
    public static function parseString($value)
    {
        $value = trim($value);

        if (is_null($value)) {
            return null;
        }

        if(!strlen($value)) {
            return "";
        }

        return (string) $value;
    }

    public static function parseInt($value)
    {
        $value = trim($value);

        if ($value == '') {
            return null;
        }

        if (is_null($value)) {
            return null;
        }

        if (is_int($value)) {
            return $value;
        }

        return (int) $value;
    }

    public static function parseDecimal($value,  $decimals = 2)
    {
        $value = trim($value);

        if ($value == '') {
            return null;
        }

        if (is_null($value)) {
            return null;
        }

        $value = str_replace([' ', '&nbsp;'], '', $value);
        $value = (float)str_replace(',', '.', $value);

        if (is_integer($decimals)) {
            $value = number_format($value, $decimals, '.', '');
        }

        return $value;
    }

    public static function parseDateTime($value)
    {
        $value = trim($value);

        if ($value == '') {
            return null;
        }

        if (is_null($value)) {
            return null;
        }

        return DateTimeService::formatDateTime($value);
    }
}
