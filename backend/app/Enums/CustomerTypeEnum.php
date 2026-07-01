<?php

namespace App\Enums;

class CustomerTypeEnum extends BaseEnum
{
    const DEALER = 'DEALER';

    const RETAILER = 'RETAILER';

    public static $valueMap = [
        self::DEALER => 'Dealer',
        self::RETAILER => 'Retailer',
    ];

    public static function getList()
    {
        return self::$valueMap;
    }

    public static function getValue($value)
    {
        return (string) isset(self::$valueMap[$value]) && self::$valueMap[$value] ? self::$valueMap[$value] : $value;
    }

    public static function getValues()
    {
        return array_values(self::getList());
    }

    public static function getKey($value)
    {
        return (string) array_search($value, self::getList(), true);
    }

    public static function getKeys()
    {
        return array_keys(self::getList());
    }

}
