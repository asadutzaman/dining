<?php

namespace App\Interfaces;

interface SmsGatewayInterface
{
    /**
     * Deliver a text message. Implementations must not throw for ordinary
     * delivery failures -- return false so the caller can decide whether the
     * failure is fatal to the request.
     */
    public function send(string $phone, string $message): bool;
}
