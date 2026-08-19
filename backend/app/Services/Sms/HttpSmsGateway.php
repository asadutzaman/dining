<?php

namespace App\Services\Sms;

use App\Interfaces\SmsGatewayInterface;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Generic HTTP gateway covering the shape most Bangladeshi SMS providers expose:
 * a GET or POST to one endpoint with an API key, a recipient and a message,
 * all named via config so a provider swap is a .env change rather than a class.
 */
class HttpSmsGateway implements SmsGatewayInterface
{
    public function send(string $phone, string $message): bool
    {
        $config = config('sms.http');

        if (empty($config['url'])) {
            Log::error('[SMS] HTTP gateway selected but SMS_HTTP_URL is not configured.');

            return false;
        }

        $payload = array_filter([
            $config['api_key_field']   => $config['api_key'],
            $config['sender_field']    => $config['sender_id'],
            $config['recipient_field'] => $phone,
            $config['message_field']   => $message,
        ], fn ($value) => $value !== null && $value !== '');

        try {
            $request = Http::timeout($config['timeout'])->asForm();

            $response = strtoupper($config['method']) === 'GET'
                ? $request->get($config['url'], $payload)
                : $request->post($config['url'], $payload);

            if ($response->successful()) {
                return true;
            }

            // Body is logged rather than surfaced: it can carry provider account
            // details, and the caller only needs to know delivery failed.
            Log::error('[SMS] Delivery failed', [
                'phone'  => $phone,
                'status' => $response->status(),
                'body'   => $response->body(),
            ]);
        } catch (\Throwable $e) {
            Log::error('[SMS] Gateway threw', ['phone' => $phone, 'error' => $e->getMessage()]);
        }

        return false;
    }
}
