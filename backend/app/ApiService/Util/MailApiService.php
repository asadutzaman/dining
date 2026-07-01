<?php

namespace App\ApiService\Util;

use App\ApiService\BaseApi;
use App\Services\HttpClientService;

class MailApiService extends BaseApi
{
    protected $async;

    protected $baseUrl;

    protected $urlPrefix;

    protected $httpClientService;

    function __construct()
    {
        $this->async = false;
        $this->urlPrefix = 'mail';
        $this->baseUrl = config('api.util_server_url');
        $this->httpClientService = new HttpClientService($this->baseUrl);
    }

    public function sendRegisterMail($to, array $data)
    {
        $mailData = [
            'to'   => $to,
            'data' => $data,
        ];

        $uri = $this->urlPrefix . '/send-register-mail';
        return $this->httpClientService->post($uri, $mailData);
    }

    public function sendForgotPasswordMail($to, array $data)
    {
        $mailData = [
            'to'   => $to,
            'data' => $data,
        ];

        $uri = $this->urlPrefix . '/send-forgot-password-mail';
        return $this->httpClientService->post($uri, $mailData);
    }

    public function sendResetPasswordMail($to, array $data)
    {
        $mailData = [
            'to'   => $to,
            'data' => $data,
        ];

        $uri = $this->urlPrefix . '/send-reset-password-mail';
        return $this->httpClientService->post($uri, $mailData);
    }

    public function sendInvitePeopleMail($to, array $data)
    {
        $mailData = [
            'to'   => $to,
            'data' => $data,
        ];

        $uri = $this->urlPrefix . '/send-invite-people-mail';
        return $this->httpClientService->post($uri, $mailData);
    }

    public function sendOtpCodeMail($to, array $data) {
        $mailData = [
            'to'   => $to,
            'data' => $data,
        ];

        $uri = $this->urlPrefix . '/send-otp-mail';
        return $this->httpClientService->post($uri, $mailData);
    }
}
