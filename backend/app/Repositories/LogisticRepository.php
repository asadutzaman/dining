<?php

namespace App\Repositories;

use App\Models\Logistic;
use App\Services\ODataService;

class LogisticRepository extends BaseRepository
{
    /**
     * @var Logistic
     */
    protected $model;

    protected $request;

    protected $oDataService;

    protected $fieldSearchable = ['name', 'description', 'code'];

    public function __construct()
    {
        $this->model         = new Logistic();
    }
    protected function init()
    {
        $this->request      = request();
        $this->oDataService = (new ODataService())->init();
    }
}
