<?php

namespace App\Enums;

class StatusEnum extends BaseEnum
{
    const ACTIVE = 1;

    const INACTIVE = 0;

    const PENDING = 0;

    const APPROVED = 1;

    const ACCESS = 1;

    const NOT_ACCESS = 0;

    public static $valueMap = [
        self::ACTIVE => 'Active',
        self::INACTIVE => 'Inactive',
    ];

    public static $valueMapApprovalStatus = [
        self::PENDING => 'Pending',
        self::APPROVED => 'Approved',
    ];

    public static $valueMapAccessStatus = [
        self::ACCESS => 'Access',
        self::NOT_ACCESS => 'Not Access',
    ];

    public static function getList()
    {
        return self::$valueMap;
    }

    public static function getValue($value)
    {
        return (string) isset(self::$valueMap[$value]) && self::$valueMap[$value] ? self::$valueMap[$value] : $value;
    }

    public static function getValueApprovalStatus($value)
    {
        return (string) isset(self::$valueMapApprovalStatus[$value]) && self::$valueMapApprovalStatus[$value] ? self::$valueMapApprovalStatus[$value] : $value;
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
