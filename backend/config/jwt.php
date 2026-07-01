<?php

return [
    'key' => env('JWT_SECRET', '7c32d31dbdd39f2111da0b1dea59e94f3ed715fd8cdf0ca3ecf354ca1a2e3e30'),
    'header' => [
        'alg' => 'HS256',
        'typ' => 'JWT',
    ],
    'exp' => [
        'access' => env('JWT_EXP_ACCESS', 1800),
        'refresh' => env('JWT_EXP_REFRESH', 20160),
    ]
];
