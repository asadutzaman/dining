<?php

namespace App\Repositories;

use App\Models\Unit;
use App\Services\ODataService;

class UnitRepository extends BaseRepository
{
    /**
     * @var Unit
     */
    protected $model;

    protected $request;

    protected $oDataService;

    protected $fieldSearchable = ['name', 'short_name'];

    public function __construct()
    {
        $this->model         = new Unit();
    }
    protected function init()
    {
        $this->request      = request();
        $this->oDataService = (new ODataService())->init();
    }
}
