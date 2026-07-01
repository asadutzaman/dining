<?php

namespace App\Services;

use App\Exceptions\ApiException;
use App\Libraries\OData\SlimOData\ODataFilter;

class ODataService
{
    private $request;
    private $baseUrl;
    private $url;
    private $fullUrl;
    private $requestUri;
    private $queryString;
    private $queryParams = [];
    private $oDataParams = [];
    private $uriSegments;

    public function init(){
        $this->request = request();

        $this->url = $this->request->url();
        $this->fullUrl = $this->request->fullUrl();
        $this->baseUrl = url('/');

        $this->queryString = $this->request->getQueryString();
        parse_str($this->queryString, $queryParams);
        $this->queryParams = $queryParams;

        $this->uriSegments = $this->request->segments();
        $this->requestUri = $this->request->getRequestUri();

        $this->setODataParams();
        return $this;
    }

    public function getQueryParams(): array
    {
        return $this->queryParams;
    }

    public function getFilterQueryParams(): array
    {    
        if (isset($this->queryParams['$queryParams']) && is_array($this->queryParams['$queryParams'])) {
            return $this->queryParams['$queryParams'] ? $this->queryParams['$queryParams'] : [];
        } else {
            return !empty($this->queryParams['$queryParams']) ? json_decode($this->queryParams['$queryParams'], true) : [];
        }
    }

    public function getODataParams(): array
    {
        return $this->oDataParams;
    }

    public function getBaseUrl(): string
    {
        return $this->baseUrl;
    }

    public function getUrl(): string
    {
        return $this->url;
    }

    public function getFullUrl(): string
    {
        return $this->fullUrl;
    }

    public function getRequestUri(): string
    {
        return $this->requestUri;
    }
    public function getQueryString(): ?string
    {
        return $this->queryString;
    }

    public function getUriSegments(): array
    {
        return $this->uriSegments;
    }

    private function setODataParams(): void
    {
        $this->parseSelect();
        $this->parseCompute();
        $this->parseSearch();
        $this->parseCount();
        $this->parseExpand();
        $this->parseFilter();
        $this->parseOrderBy();
        $this->parseApply();
        $this->parseSkip();
        $this->parseTop();
    }

    private function parseSelect()
    {
        if (isset($this->queryParams['$select']) && !empty($this->queryParams['$select'])) {
            $value = trim($this->queryParams['$select']);
            $this->oDataParams['select'] = explode(',', $value);
        }
    }

    private function parseCompute()
    {
        if (isset($this->queryParams['$compute']) && !empty($this->queryParams['$compute'])) {
            $value = trim($this->queryParams['$compute']);
            $this->oDataParams['compute'] = $value;
        }
    }

    private function parseSearch()
    {
        if (isset($this->queryParams['$search']) && !empty($this->queryParams['$search'])) {
            $value = trim($this->queryParams['$search']);
            $this->oDataParams['search'] = $value;
        }
    }

    private function parseCount()
    {
        if (isset($this->queryParams['$count']) && !empty($this->queryParams['$count'])) {
            $value = trim($this->queryParams['$count']);
            $this->oDataParams['count'] = $value == 'true';
        }
    }

    private function parseExpand()
    {
        if (isset($this->queryParams['$expand']) && !empty($this->queryParams['$expand'])) {
            $value = trim($this->queryParams['$expand']);
            $this->oDataParams['expand'] = $value;
        }
    }

    private function parseFilter()
    {
        try {
            if (isset($this->queryParams['$filter']) && !empty($this->queryParams['$filter'])) {
                $value = trim($this->queryParams['$filter']);
                $data = ODataFilter::process_string($value);
                $this->oDataParams['filter'] = @json_decode(json_encode($data), true);
            }
        } catch (\Exception $e) {
            throw new ApiException('Incorrect format for $filter argument \''.$value.'\'');
        }
    }

    private function parseOrderBy()
    {
        if (isset($this->queryParams['$orderby']) && !empty($this->queryParams['$orderby'])) {
            $value = trim($this->queryParams['$orderby']);
            $this->oDataParams['orderby'] = explode(",", $value);
        }
    }

    private function parseApply()
    {
        if (isset($this->queryParams['$apply']) && !empty($this->queryParams['$apply'])) {
            $value = trim($this->queryParams['$apply']);
            $this->oDataParams['apply'] = explode(",", $value);
        }
    }

    private function parseSkip()
    {
        if (isset($this->queryParams['$skip']) && !empty($this->queryParams['$skip'])) {
            $value = trim($this->queryParams['$skip']);
            if (!is_numeric($value)) {
                throw new ApiException('Incorrect format for $skip argument \''.$value.'\'');
            }
            $this->oDataParams['skip'] = $value;
        }
    }

    private function parseTop()
    {
        if (isset($this->queryParams['$top']) && !empty($this->queryParams['$top'])) {
            $value = trim($this->queryParams['$top']);
            if (!is_numeric($value)) {
                throw new ApiException('Incorrect format for $top argument \''.$value.'\'');
            }
            $this->oDataParams['top'] = intval($value);
        }
    }

}
