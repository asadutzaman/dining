<?php

namespace App\Repositories;

use App\Models\Resource;
use App\Services\ODataService;

class ResourceRepository extends BaseRepository
{
    /**
     * @var Resource
     */
    protected $model;

    protected $request;

    protected $oDataService;

    protected $fieldSearchable = ['name', 'display_name', 'resource_uri', 'controller_name', 'server_url_prefix'];

    public function __construct()
    {
        $this->model = new Resource();
    }

    protected function init()
    {
        $this->request = request();
        $this->oDataService = (new ODataService())->init();
    }

    public function getResourceInfoById($id)
    {
        return $this->findById($id);
    }

    public function getResourceNameById($id)
    {
        $result = $this->findById($id);
        return isset($result->display_name) ? $result->display_name : '';
    }
}
