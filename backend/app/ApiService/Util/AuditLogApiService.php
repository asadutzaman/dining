<?php

namespace App\ApiService\Util;

use App\ApiService\BaseApi;
use App\Services\HttpClientService;

class AuditLogApiService extends BaseApi
{
    protected $async;

    protected $baseUrl;

    protected $urlPrefix;

    protected $httpClientService;

    function __construct()
    {
        $this->async = false;
        $this->urlPrefix = 'audit-log';
        $this->baseUrl = config('api.util_server_url');
        $this->httpClientService = new HttpClientService($this->baseUrl);
    }
}
