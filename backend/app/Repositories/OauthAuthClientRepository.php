<?php

namespace App\Repositories;

use App\Models\OauthAuthClient;
use App\Services\ODataService;

class OauthAuthClientRepository extends BaseRepository
{
    /**
     * @var OauthAuthClient
     */
    protected $model;

    protected $request;

    protected $oDataService;

    protected $fieldSearchable = ['name'];

    public function __construct()
    {
        $this->model        = new OauthAuthClient();
    }
    protected function init()
    {
        $this->request      = request();
        $this->oDataService = (new ODataService())->init();
    }
}
