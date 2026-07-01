<?php

namespace App\Repositories;

use App\Models\PasswordReset;
use App\Services\ODataService;

class PasswordResetRepository extends BaseRepository
{
    /**
     * @var PasswordReset
     */
    protected $model;

    protected $request;

    protected $oDataService;

    protected $fieldSearchable = ['email'];

    public function __construct()
    {
        $this->model        = new PasswordReset();
    }
    protected function init()
    {
        $this->request      = request();
        $this->oDataService = (new ODataService())->init();
    }
}
