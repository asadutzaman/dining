<?php

namespace App\Repositories;

use App\Models\ScopeAction;
use App\Services\ODataService;

class ScopeActionRepository extends BaseRepository
{
    /**
     * @var ScopeAction
     */
    protected $model;

    protected $request;

    protected $oDataService;

    protected $fieldSearchable = ['http_method', 'action_name', 'uri'];

    public function __construct()
    {
        $this->model = new ScopeAction();
    }

    protected function init()
    {
        $this->request = request();
        $this->oDataService = (new ODataService())->init();
    }
}
