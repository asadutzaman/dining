<?php

namespace App\Services;

use App\Models\User;
use App\Models\OauthAccessToken;
use App\Models\OauthRefreshToken;
use App\Exceptions\JwtException;
use App\Repositories\OauthAccessTokenRepository;
use Illuminate\Support\Arr;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class JwtService
{
    protected $token;

    protected $payload;

    public function getTokenForRequest()
    {
        $request = request();

        if ($this->token !== null) {
            return $this->token;
        }

        $token = $request->query('token');

        if (empty($token)) {
            $token = $request->input('token');
        }

        if (empty($token)) {
            $token = $request->bearerToken();
        }

        // if ($this->isExpired($token)) {
        //     $this->token = $token;
        // } else {
        //     $this->token = null;
        // }

        return $this->token = $token;
    }

    /**
     * Get the token for the current request.
     *
     * @return string
     */
    public function hasToken()
    {
        return is_null($this->getTokenForRequest()) ? false : true;
    }

    public function generateTokens($sub, $options = [])
    {
        try {
            // $roleRepository = new RoleRepository();
            // $roleInfo = $roleRepository->getById($sub->role_id);
            $userData = [
                'id'                 => $sub->id,
                'uuid'               => $sub->uuid,
                'organization_id'    => Arr::get($options, 'organization_id'),
                'organogram_id'      => Arr::get($options, 'organogram_id'),
                'role_id'            => null,
                'role_code'          => null,
                'profile_type'       => $sub->profile_type,
                'profile_id'         => $sub->profile_id,
                'name'               => $sub->name,
                'company_name'       => $sub->company_name,
                'mobile'             => $sub->mobile,
                'email'              => $sub->email,
                'remember_token'     => $sub->remember_token,
                'status'             => $sub->status,
            ];

            $accessToken  = $this->createAccessToken($userData, $options);
            $refreshToken = $this->createRefreshToken($userData, $options);

            // Save Access Token
            $modelAccessToken = new OauthAccessToken();
            $data = [
                'user_id'      => $sub->id,
                'name'         => 'MyApp',
                'access_token' => $accessToken['token'],
                'expires_at'   => $accessToken['exp'],
            ];
            $resultAccessToken = $modelAccessToken->create($data);

            // Save Refresh Token
            $modelRefreshToken = new OauthRefreshToken();
            $data = [
                'user_id'         => $sub->id,
                'access_token_id' => $resultAccessToken->id,
                'refresh_token'   => $refreshToken['token'],
                'expires_at'      => $accessToken['exp'],
            ];
            $resultRefreshToken = $modelRefreshToken->create($data);

            return [
                'accessToken'  => $accessToken['token'],
                'refreshToken' => $refreshToken['token']
            ];
        } catch (\Exception $e) {
            throw new $e;
        }
    }

    public function createAccessToken($sub, $options = [])
    {
        $exp = config('jwt.exp.access');
        $exp = $exp === 0 ? null : time() + ($exp * 60);
        $expDateTime = Carbon::createFromTimestamp($exp)->toDateTimeString();

        $token = $this->createToken($sub, $exp, $options);
        return ['token' => $token, 'exp' => $expDateTime];
    }

    public function createRefreshToken($sub, $options = [])
    {
        $exp = config('jwt.exp.refresh');
        $exp = $exp === 0 ? null : time() + ($exp * 60);
        $expDateTime = Carbon::createFromTimestamp($exp)->toDateTimeString();

        $token = $this->createToken($sub, $exp, $options);
        return ['token' => $token, 'exp' => $expDateTime];
    }

    public function createToken($sub, $exp, $options = [])
    {
        $header = $this->encode(config('jwt.header'));

        $payload = $this->encode(array_merge([
            'sub' => $sub,
            'iat' => time(),
            'exp' => $exp,
            'jti' => Str::random(10),
        ], $options));

        $signature = $this->sign($header, $payload);

        return "$header.$payload.$signature";
    }

    protected function encode($data)
    {
        return $this->base64url_encode(json_encode($data));
    }

    protected function decode($data)
    {
        return json_decode($this->base64url_decode($data));
    }

    protected function base64url_encode($data)
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    protected function base64url_decode($data)
    {
        return base64_decode(str_pad(strtr($data, '-_', '+/'), strlen($data) % 4, '=', STR_PAD_RIGHT));
    }

    protected function sign($header, $payload)
    {
        return $this->base64url_encode(hash_hmac('SHA256', "$header.$payload", config('jwt.key'), true));
    }

    public function verify($token)
    {
        if (preg_match('/Bearer\s(\S+)/', $token, $matches)) {
            $token = $matches[1];
        }

        $tokenParts = explode('.', $token);
        if (count($tokenParts) !== 3) return false;

        $header = $tokenParts[0];
        $payload = $tokenParts[1];
        $signatureProvided = $tokenParts[2];

        $signatureToken = $this->base64url_encode(hash_hmac('SHA256', "$header.$payload", config('jwt.key'), true));

        return hash_equals($signatureToken,  $signatureProvided);
    }

    public function isExpired($token)
    {
        $payload = $this->getPayload($token);

        if (is_null($payload->exp)) {
            return false;
        }

        return Carbon::createFromTimestamp($payload->exp)->isPast();
    }

    public function checkToken($token)
    {
        if (preg_match('/Bearer\s(\S+)/', $token, $matches)) {
            $token = $matches[1];
        }

        if (!$token) {
            throw new JwtException("We could not find the access token.");
        }

        if (!$this->verify($token)) {
            throw new JwtException("The access token is invalid.");
        }

        if ($this->isExpired($token)) {
            throw new JwtException("The access token expired.");
        }

        $oauthAccessTokenRepository = new OauthAccessTokenRepository();
        $accessTokenInfo = $oauthAccessTokenRepository->getAccessTokenInfo($token);

        $revoked = isset($accessTokenInfo->revoked) ? $accessTokenInfo->revoked : null;
        if ($revoked) {
            throw new JwtException("The access token revoked.");
        }

        $user = $this->getUserFromToken($token);
        if (!$user) {
            throw new JwtException('The user does not exist.');
        }

        if (!$user->status) {
            throw new JwtException('The account has not been activated.');
        }

        return $user;
    }

    public function getUserFromToken($token)
    {
        $payload = $this->getPayload($token);
        if (empty($payload)) {
            return false;
        }

        return User::where('uuid', $payload->sub->uuid)->first();
    }

    public function getPayload($token)
    {
        $payload = explode('.', $token);

        if (count($payload) !== 3) return null;

        $payloadData = $this->decode($payload[1]);

        // if ($payloadData->exp && !Carbon::createFromTimestamp($payloadData->exp)->isPast()) {
        //     return false;
        // }

        return $payloadData;
    }

    public function getTokeInfo()
    {
        $token = $this->getTokenForRequest();
        // jwt verify & check expired
        $payload = $this->getPayload($token);
        // database verify
        $userLiveAccessTokenInfo = (new OauthAccessTokenRepository())
            ->findWhere('access_token', $token)
            ->where('expires_at', '>=', Carbon::now())
            ->first();

        // delete expired token
        (new OauthAccessTokenRepository())
            ->newQuery()
            ->where('expires_at', '<', Carbon::now())
            ->forceDelete();

        if (empty($payload) || empty($userLiveAccessTokenInfo)) {
            return null;
        }

        return !empty($payload) && isset($payload->sub) ? $payload->sub : null;
    }

    public function getTokeInfoFomAccessToken($token)
    {
        $payload = $this->getPayload($token);
        return !empty($payload) && isset($payload->sub) ? $payload->sub : null;
    }
}
