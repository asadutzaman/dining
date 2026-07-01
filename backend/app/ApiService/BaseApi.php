<?php

namespace App\ApiService;

class BaseApi
{
    protected $async;

    protected $baseUrl;

    protected $urlPrefix;

    protected $httpClientService;

    public final function setAsync($async)
    {
        $this->httpClientService->setAsync($async);
    }

    public function index(array $query = [])
    {
        $uri = $this->urlPrefix;
        return $this->httpClientService->get($uri, $query);
    }

    public function store(array $formData=[], array $query=[], array $multipart=[])
    {
        $uri = $this->urlPrefix;
        return $this->httpClientService->post($uri, $formData, $query);
    }

    public function show($id, array $query = [])
    {
        $uri = $this->urlPrefix . '/' . $id;
        return $this->httpClientService->get($uri, $query);
    }

    public function update($id, array $formData=[], array $query=[], array $multipart=[])
    {
        $uri = $this->urlPrefix . '/' . $id;
        return $this->httpClientService->put($uri, $formData, $query);
    }

    public function updateFields($id, array $formData=[], array $query=[], array $multipart=[])
    {
        $uri = $this->urlPrefix . '/' . $id;
        return $this->httpClientService->patch($uri, $formData, $query);
    }

    public function destroy($id, array $query = [])
    {
        $uri = $this->urlPrefix . '/' . $id;
        return $this->httpClientService->delete($uri, $query);
    }

}
