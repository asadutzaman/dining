<?php

return [
    'defaults' => [
        'guard' => 'token',
        'passwords' => 'users',
    ],

    'guards' => [
        'web' => [
            'driver' => 'session',
            'provider' => 'users',
        ],
        'api' => [
            'driver'   => 'token',
            'provider' => 'users',
        ],
        'token' => [
            'driver'   => 'access_token',
        ],

        /*
        | The KhaiDai mobile app. Sanctum-backed and entirely separate from the
        | staff guards above -- a dining member is not a system user and must
        | never be able to reach the admin surface with a member token.
        */
        'member' => [
            'driver'   => 'sanctum',
            'provider' => 'members',
        ],
    ],

    'providers' => [
        'users' => [
            'driver' => 'eloquent',
            'model' => App\Models\User::class,
        ],

        'members' => [
            'driver' => 'eloquent',
            'model'  => App\Models\Dining\Member::class,
        ],
    ],

    'passwords' => [
        'users' => [
            'provider' => 'users',
            'table' => 'password_resets',
            'expire' => 60,
        ],
    ],

];
