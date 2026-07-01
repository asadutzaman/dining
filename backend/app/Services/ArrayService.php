<?php

namespace App\Services;

class ArrayService
{
    public static function findKey($array, $keySearch)
    {
        foreach ($array as $key => $item) {
            if ($key === $keySearch) {
                return true;
            }
            else {
                if (is_array($item) && static::findKey($item, $keySearch)) {
                    return true;
                }
            }
        }

        return false;
    }

    public static function findNumericKey($array, $keySearch)
    {
        foreach ($array as $key => $item) {
            if ($key == $keySearch) {
                return true;
            }
            else {
                if (is_array($item) && static::findNumericKey($item, $keySearch)) {
                    return true;
                }
            }
        }

        return false;
    }

    public static function removeEmptyElements($array)
    {
        if (!is_array($array)) {
            return $array;
        }

        return array_filter($array, function($element) {
            return ($element !== NULL && $element !== FALSE && $element !== "");
        });
    }
}
