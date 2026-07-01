<?php

return [
    'default' => env('DB_CONNECTION', 'pgsql_local_server'),

    'connections' => [
        'mysql_local_server' => [
            'driver'    => 'mysql',
            'host'      => env('DB_HOST', 'localhost'),
            'port'      => env('DB_PORT', '3306'),
            'database'  => env('DB_DATABASE', 'dmp_lims'),
            'username'  => env('DB_USERNAME', 'root'),
            'password'  => env('DB_PASSWORD', ''),
            'charset'   => env('DB_CHARSET', 'utf8mb4'),
            'collation' => env('DB_COLLATION', 'utf8mb4_unicode_ci'),
            'prefix'     => env('DB_PREFIX', 'lims_aq4nlg_'),
            'strict'    => env('DB_STRICT_MODE', false),
        ],
        'pgsql_local_server' => [
            'driver'    => 'pgsql',
            'host'      => env('DB_HOST', 'localhost'),
            'port'      => env('DB_PORT', '5432'),
            'database'  => env('DB_DATABASE', 'dmp_lims'),
            'username'  => env('DB_USERNAME', 'postgres'),
            'password'  => env('DB_PASSWORD', 'root'),
            'charset'   => env('DB_CHARSET', 'utf8'),
            'collation' => env('DB_COLLATION', 'utf8mb4_unicode_ci'),
            'prefix'     => env('DB_PREFIX', 'lims_aq4nlg_'),
            'prefix_indexes' => true,
            'strict'    => env('DB_STRICT_MODE', false),
        ],
    ],

    'migrations' => 'migrations',
];
