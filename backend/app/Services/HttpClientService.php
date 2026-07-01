<?php

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use App\Exceptions\ApiException;
use Illuminate\Support\Arr;

class HttpClientService
{
    private $loggerService;
    private $httpClient;
    private $baseUrl;
    private $token;
    private $timeout = 180;
    private $readTimeout = 180;
    private $verify = false;
    private $async = false;

    private $headers = [];
    private $defaultHeaders = [
        'Accept' => 'application/json'
    ];
    private $multipartHeaders = [
        'Accept' => 'application/json'
    ];

    private $logger;
    protected $source;
    private $statusCode;
    private $start;

    public function __construct(string $baseUrl)
    {
        $this->httpClient = new Client();
        $this->loggerService = new LoggerService();
        $this->setBaseUrl($baseUrl);
    }

    public final function setAsync($async)
    {
        $this->async = $async;
    }

    protected function request(string $method, string $uri, $options)
    {
        $request = request();
        $token = $request->header('Authorization');
        $this->setBearerToken($token);
        $this->start = time();

        if ($this->async) {
            return $this->requestAsync($method, $uri, $options);
        }
        else {
            return $this->requestWithoutAsync($method, $uri, $options);
        }
    }

    protected function requestWithoutAsync(string $method, string $uri, $options)
    {
        try {
            $url = $this->baseUrl . $uri;
            $options['timeout'] = $this->timeout;
            $options['read_timeout'] = $this->readTimeout;
            $options['verify'] = $this->verify;

            if (isset($options['multipart']) && count($options['multipart']) !== 0) {
                unset($options['form_params']);
                unset($options['json']);
                $options['headers'] = array_merge($this->multipartHeaders, $this->headers);
            }
            else {
                $options['headers'] = array_merge($this->defaultHeaders, $this->headers);
                unset($options['multipart']);
            }

            $this->logInfo($url);
            $response = $this->httpClient->request($method, $url, $options);
            return $this->getResponseContent($response);
        } catch (RequestException $e) {
            $url = $this->baseUrl . $uri;
            $this->setStatusCode($e->getResponse() ? $e->getResponse()->getStatusCode() : 500);
            $this->logWarning($url, $options, $e);
            $this->throwErrorMessage($e);
        }
    }

    public function requestAsync(string $method, string $uri, $options)
    {
        $url = $this->baseUrl . $uri;
        $options['timeout'] = $this->timeout;
        $options['read_timeout'] = $this->readTimeout;
        $options['verify'] = $this->verify;

        if (isset($options['multipart']) && count($options['multipart']) !== 0) {
            unset($options['form_params']);
            unset($options['json']);
            $options['headers'] = array_merge($this->multipartHeaders, $this->headers);
        }
        else {
            $options['headers'] = array_merge($this->defaultHeaders, $this->headers);
            unset($options['multipart']);
        }

        return $this->httpClient->requestAsync($method, $url, $options);
    }

    public function get(string $uri, array $query=[])
    {
        $options = [
            'query' => $query
        ];

        return $this->request('GET', $uri, $options);
    }

    public function post(string $uri, array $formData=[], array $query=[], array $multipart=[]) {
        $options = [
            'query' => $query,
            'json' => $formData,
            'form_params' => $formData,
            'multipart' => $multipart
        ];

        return $this->request('POST', $uri, $options);
    }

    public function put(string $uri, array $formData=[], array $query=[], array $multipart=[]) {
        $options = [
            'query' => $query,
            'json' => $formData,
            'form_params' => $formData,
            'multipart' => $multipart
        ];

        return $this->request('PUT', $uri, $options);
    }

    public function patch(string $uri, array $formData=[], array $query=[], array $multipart=[]) {
        $options = [
            'query' => $query,
            'json' => $formData,
            'form_params' => $formData,
            'multipart' => $multipart
        ];

        return $this->request('PATCH', $uri, $options);
    }

    public function delete(string $uri, $query=[])
    {
        $options = [
            'query' => $query,
        ];

        return $this->request('DELETE', $uri, $options);
    }

    public function head(string $uri, array $query=[])
    {
        $options = [
            'query' => $query,
        ];

        return $this->request('HEAD', $uri, $options);
    }

    public function options(string $uri, array $query=[])
    {
        $options = [
            'query' => $query,
        ];

        return $this->request('OPTIONS', $uri, $options);
    }

    public function setBaseUrl(string $baseUrl = null)
    {
        $this->baseUrl = $baseUrl;
        return $this;
    }

    public function setBearerToken(string $token = null)
    {
        $this->token = $token;

        if ($token) {
            $this->headers['Authorization'] = trim($token);
        }

        return $this;
    }

    public function setBasicAuthentication(string $token = null)
    {
        $this->token = $token;

        if ($token) {
            $this->headers['Authorization'] = "Bearer $token";
        }

        return $this;
    }

    public function setHeader(string $key, string $value)
    {
        $this->headers[$key] = $value;
        return $this;
    }

    public function setTimeout(string $value)
    {
        $this->timeout = $value;
        return $this;
    }

    private function logInfo($uri)
    {
        $extra_data = [
            'time'   => time() - $this->start,
            'source' => $this->source,
            'uri'    => $uri,
        ];

        // $this->loggerService->info('Http Client Info', $extra_data);
    }

    private function logWarning($url, $options, RequestException $e)
    {
        $response = $e->getResponse();
        $extra_data = [
            'time'    => time() - $this->start,
            'source'  => $this->source,
            'uri'     => $url,
            'payload' => Arr::except($options, ['headers', 'json.password']),
            'code'    => $response ? $response->getStatusCode() : '--'
        ];

        // $this->loggerService->warning('Http Client Warning', $extra_data);
    }

    protected function throwErrorMessage(RequestException $e)
    {
        if ($this->statusCode == 401 || $this->statusCode == 402 || $this->statusCode == 403 || $this->statusCode == 404 || $this->statusCode == 405 || $this->statusCode == 409 || $this->statusCode == 412 || $this->statusCode == 422) {
            $errorMessage = json_decode((string) $e->getResponse()->getBody());
            throw new ApiException($errorMessage, $this->getStatusCode());
        }
        else {
            $errorMessage = $e->getResponse()->getBody() ?? $e->getMessage();
            throw new \Exception($errorMessage, $this->getStatusCode());
        }
    }

    public function setStatusCode($code)
    {
        $this->statusCode = $code;
        return $this;
    }

    public function getStatusCode()
    {
        return $this->statusCode;
    }

    public function getResponseContent($curlResponse)
    {
        $response = $curlResponse->getBody()->getContents();
        return json_decode($response);
    }
}
