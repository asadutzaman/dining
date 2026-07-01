<?php

namespace App\Constants;

class Common {
    const ROLE_ADMIN_PK = 1;
    const ROLE_MAINTAINER_PK = 2;
    const ROLE_SUPPLIER_PK = 3;
    const ROLE_GUEST_PK = 6;

    // Status
    const STATUS_ACTIVE = 1;
    const STATUS_INACTIVE = 2;
    const STATUS_DELETED = -2;
    const STATUS_PAID = 1;
    const STATUS_APPROVED = 2;
    const STATUS_CANCEL = 3;
    const STATUS_PENDING = 4;
    const STATUS_VERIFIED = 5;

    // Boolean
    const YES = 1;
    const NO = 0;

    // Default Value
    const DEFAULT_ORGANIZATION_ID = 1;
    const DEFAULT_ORGANOGRAM_ID = 1;
    const DEFAULT_WORKSPACE_ID = 1;

    public static function statusDropDownList($id = null)
    {
        $data = [
            self::STATUS_ACTIVE => 'Active',
            self::STATUS_INACTIVE => 'Inactive',
        ];

        if (func_num_args() == 0) return $data;
        else if (array_key_exists($id, $data)) return $data[$id];
        else return '';
    }

    public static function booleanDropDownList($id=null)
    {
        $data = [
            self::YES => 'Yes',
            self::NO => 'No',
        ];

        if (func_num_args() == 0) return $data;
        else if (array_key_exists($id, $data)) return $data[$id];
        else return '';
    }

}
