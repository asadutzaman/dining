<?php

namespace App\Services\Sms;

use App\Interfaces\SmsGatewayInterface;
use Illuminate\Support\Facades\Log;

/**
 * Development driver: writes the message to the log instead of sending it, so
 * the OTP login flow is fully exercisable without an SMS account. Selected via
 * SMS_DRIVER=log (the default outside production).
 */
class LogSmsGateway implements SmsGatewayInterface
{
    public function send(string $phone, string $message): bool
    {
        Log::channel(config('sms.log_channel'))->info('[SMS] to ' . $phone . ': ' . $message);

        return true;
    }
}
