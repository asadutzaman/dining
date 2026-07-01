<?php

namespace App\Repositories;

use App\Models\OauthAccessToken;
use App\Services\ODataService;

class OauthAccessTokenRepository extends BaseRepository
{
    /**
     * @var OauthAccessToken
     */
    protected $model;

    protected $request;

    protected $oDataService;

    protected $fieldSearchable = ['name'];

    public function __construct()
    {
        $this->model = new OauthAccessToken();
    }

    protected function init()
    {
        $this->request = request();
        $this->oDataService = (new ODataService())->init();
    }

    public function getAccessTokenInfoByIdToken($idToken)
    {
        return $this->newQuery()
            ->where('access_token', $idToken)
            ->first();
    }

    public function getAccessTokenInfo($token)
    {
        return $this->newQuery()
            ->where('access_token', $token)
            ->first();
    }

    public function revokeToken($token)
    {
        return $this->newQuery()
            ->where('access_token', $token)
            ->update([
                'revoked' => true
            ]);
    }

    public function revokePreviousTokens($userId)
    {
        return $this->newQuery()
            ->where('user_id', $userId)
            ->update([
                'revoked' => true
            ]);
    }

    public function revokeOtherTokenThisUser($userId, $token)
    {
        return $this->newQuery()
            ->where('user_id', $userId)
            ->where('access_token', '!=', $token)
            ->update([
                'revoked' => true
            ]);
    }

}
