<?php
return [
    // Microservice Server URL
    'base_url'                  => env('BASE_URL', 'http://localhost:3000/'),
    'util_server_url'           => env('UTIL_SERVER_URL', 'http://localhost:8000/'),

    // Microservice URL Prefix
    'auth_server_url_prefix'            => env('AUTH_SERVER_URL_PREFIX', 'auth'),
    'util_server_url_prefix'            => env('UTIL_SERVER_URL_PREFIX', 'util'),

    // Others
    'timeout'          => env('AUTH_TIMEOUT', 180),
    'read_timeout'     => env('AUTH_READ_TIMEOUT', 180),
    'verify'           => env('AUTH_VERIFY', false),

    // NCMS: source of truth for the staff/student roster the dining members are drawn from
    'ncms' => [
        'url'            => env('NCMS_API_URL', 'http://192.168.98.153:8085/ncms/api/'),
        'users_endpoint' => env('NCMS_USERS_ENDPOINT', 'dining/users'),
        'image_base_url' => env('NCMS_IMAGE_BASE_URL', 'http://192.168.100.252:8081/'),
        'timeout'        => env('NCMS_TIMEOUT', 60),
    ],
];
