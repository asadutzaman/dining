<?php

namespace App\Repositories;

use App\Models\Shelve;
use App\Services\ODataService;

class ShelveRepository extends BaseRepository
{
    /**
     * @var Shelve
     */
    protected $model;

    protected $request;

    protected $oDataService;

    protected $fieldSearchable = ['name', 'branch_id'];

    public function __construct()
    {
        $this->model         = new Shelve();
    }
    protected function init()
    {
        $this->request      = request();
        $this->oDataService = (new ODataService())->init();
    }
}
