<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Driver
    |--------------------------------------------------------------------------
    |
    | "log" writes messages to the log instead of sending them, which makes the
    | member OTP login fully testable without a provider account. "http" posts
    | to the endpoint configured below.
    |
    */

    'driver' => env('SMS_DRIVER', 'log'),

    'log_channel' => env('SMS_LOG_CHANNEL', config('logging.default')),

    'http' => [
        'url'    => env('SMS_HTTP_URL'),
        'method' => env('SMS_HTTP_METHOD', 'POST'),

        'api_key'   => env('SMS_API_KEY'),
        'sender_id' => env('SMS_SENDER_ID'),

        // Field names vary by provider; map them here rather than in code.
        'api_key_field'   => env('SMS_API_KEY_FIELD', 'api_key'),
        'sender_field'    => env('SMS_SENDER_FIELD', 'senderid'),
        'recipient_field' => env('SMS_RECIPIENT_FIELD', 'msisdn'),
        'message_field'   => env('SMS_MESSAGE_FIELD', 'sms'),

        'timeout' => (int) env('SMS_HTTP_TIMEOUT', 15),
    ],

    /*
    |--------------------------------------------------------------------------
    | Member login OTP
    |--------------------------------------------------------------------------
    */

    'otp' => [
        'length'      => (int) env('MEMBER_OTP_LENGTH', 6),
        'ttl_seconds' => (int) env('MEMBER_OTP_TTL', 300),

        // Wrong guesses allowed against a single code before it is burned.
        'max_attempts' => (int) env('MEMBER_OTP_MAX_ATTEMPTS', 5),

        // Codes a single phone may request inside the window below.
        'max_per_window'      => (int) env('MEMBER_OTP_MAX_PER_WINDOW', 5),
        'rate_window_seconds' => (int) env('MEMBER_OTP_RATE_WINDOW', 3600),

        // Seconds a client must wait before asking for another code.
        'resend_cooldown_seconds' => (int) env('MEMBER_OTP_RESEND_COOLDOWN', 60),

        /*
        | Fixed code for a nominated test phone, so app-store reviewers and QA can
        | sign in without SMS. Leave MEMBER_OTP_DEMO_PHONE unset in production.
        */
        'demo_phone' => env('MEMBER_OTP_DEMO_PHONE'),
        'demo_code'  => env('MEMBER_OTP_DEMO_CODE'),

        /*
        |----------------------------------------------------------------------
        | DEVELOPMENT ONLY: skip code verification entirely
        |----------------------------------------------------------------------
        |
        | With this on, verify-otp accepts ANY code and signs in whoever owns the
        | phone number. That is a complete authentication bypass -- knowing a
        | member's number is enough to become them.
        |
        | It is ignored outright when APP_ENV=production (see
        | MemberAuthService::bypassEnabled), so it cannot be switched on in a
        | live environment by editing .env alone.
        |
        */
        'bypass_verification' => env('MEMBER_OTP_BYPASS', false),
    ],

    /*
    |--------------------------------------------------------------------------
    | Member access tokens
    |--------------------------------------------------------------------------
    */

    'token' => [
        'name'         => 'khaidai-mobile',
        'ttl_days'     => (int) env('MEMBER_TOKEN_TTL_DAYS', 60),
        // One active token per device; signing in again on the same device
        // replaces the previous one rather than accumulating tokens forever.
        'single_per_device' => true,
    ],

];
