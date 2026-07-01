<?php

namespace App\Interfaces;

use Illuminate\Http\Response;

interface JwtServiceInterface
{
    // Generate Token
    public function createToken(JWTAuthenticatable $user);
    public function generateJwtToken(array $claims): string;

    // Verify Token
    public function validate(string $token = null): int;
    public function invalidate(string $token = null, bool $forceForever = false): void;

    // Refresh Token
    public function refreshAccessToken(Response $response): Response;

    // PayloadJWT
    public function HeaderJWT();
    public function PayloadJWT($payload);
    public function Signature($string);

    // Decode Token
    public function decodeToken();

    // Exists
    public static function publicTokenExists($publicToken);
}
