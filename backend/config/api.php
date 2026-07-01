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
];
