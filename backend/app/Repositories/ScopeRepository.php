<?php

namespace App\Repositories;

use App\Models\Scope;
use App\Services\ODataService;

class ScopeRepository extends BaseRepository
{
    /**
     * @var Scope
     */
    protected $model;

    protected $request;

    protected $oDataService;

    protected $fieldSearchable = ['scope', 'display_name', 'action_name', 'uri'];

    public function __construct()
    {
        $this->model = new Scope();
    }

    protected function init()
    {
        $this->request = request();
        $this->oDataService = (new ODataService())->init();
    }

    public function getScopeInfoById($id)
    {
        return $this->findById($id);
    }
}
