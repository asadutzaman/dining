<?php

namespace App\Services;

use GuzzleHttp\Client;

class DoptarRestApiService
{
    protected $request;
    private $token;
    private $httpClient;
    private $clientId = 'D4G6TX';
    private $username = '200000002986';
    private $password = 'HT%5TW@4';
    private $baseUrl = 'https://n-doptor-accounts-stage.nothi.gov.bd';

    private $headers = [];
    private $defaultHeaders = [
        'Accept' => 'application/json',
        'Content-Type' => 'application/json',
        'api-version' => 1,
    ];

    public function __construct()
    {
        $this->request = request();
        $this->httpClient  = new Client();

        $this->token = $this->getAccessToken();
        $this->setBearerToken($this->token);
        $this->setHeaders();
    }

    public function getAccessToken() {
        $url = $this->baseUrl . '/api/client/login';
        $payload = [
            'headers' => $this->defaultHeaders,
            'json' => [
                'client_id' => $this->clientId,
                'username' => $this->username,
                'password' => $this->password,
            ]
        ];

        $apiRequest = $this->httpClient->post($url, $payload);
        $response = json_decode($apiRequest->getBody());

        return $response->data->token;
    }

    public function setBearerToken(string $token = null)
    {
        $this->token = $token;

        if ($token) {
            $this->headers['Authorization'] = 'Bearer ' . trim($token);
        }

        return $this;
    }

    public function setHeaders()
    {
        $this->headers = array_merge($this->defaultHeaders, $this->headers);
    }

    public function getDoptarOrganogram($ministryId)
    {
        $url = $this->baseUrl . '/api/v1/office';

        $payload = [
            'headers' => $this->headers,
            'query' => [
                'ministry' => $ministryId
            ]
        ];

        $response = $this->httpClient->get($url, $payload);
        return json_decode($response->getBody());
    }

    public function getOrganogramByOffice($officeId)
    {
       // $url = $this->baseUrl . '/api/office/unit-designation-employee-map';
        $url = $this->baseUrl . '/api/v1/officeunit';

        $payload = [
            'headers' => $this->headers,
            'query' => [
               // 'office_id' => $officeId
                'office' => $officeId,
               // 'ministry' => $ministryId

            ]
        ];

        $response = $this->httpClient->get($url, $payload);
        return json_decode($response->getBody());
    }

    // public function getOrganogramByOffice($officeId)
    // {
    //    // $url = $this->baseUrl . '/api/office/unit-designation-employee-map';
    //     $url = $this->baseUrl . '/api/v1/officeunit';

    //     $payload = [
    //         'headers' => $this->headers,
    //         'json' => [
    //            // 'office_id' => $officeId
    //             'office' => $officeId
    //         ]
    //     ];

    //     $response = $this->httpClient->get($url, $payload);
    //     return json_decode($response->getBody());
    // }




}
