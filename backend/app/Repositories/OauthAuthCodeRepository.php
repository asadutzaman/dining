<?php

namespace App\Repositories;

use App\Models\OauthAuthCode;
use App\Services\ODataService;

class OauthAuthCodeRepository extends BaseRepository
{
    /**
     * @var OauthAuthCode
     */
    protected $model;

    protected $request;

    protected $oDataService;

    protected $fieldSearchable = ['token'];

    public function __construct()
    {
        $this->model        = new OauthAuthCode();
    }
    protected function init()
    {
        $this->request      = request();
        $this->oDataService = (new ODataService())->init();
    }
}
