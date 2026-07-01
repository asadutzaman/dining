<?php

namespace App\Repositories;

use App\Models\OauthRefreshToken;
use App\Services\ODataService;

class OauthRefreshTokenRepository extends BaseRepository
{
    /**
     * @var OauthRefreshToken
     */
    protected $model;

    protected $request;

    protected $oDataService;

    protected $fieldSearchable = ['refresh_token'];

    public function __construct()
    {
        $this->model        = new OauthRefreshToken();
    }
    protected function init()
    {
        $this->request      = request();
        $this->oDataService = (new ODataService())->init();
    }

    public function getRefreshTokenInfo($refreshToken)
    {
        return $this->newQuery()
            ->where(['refresh_token' => $refreshToken])
            ->first();
    }
}
