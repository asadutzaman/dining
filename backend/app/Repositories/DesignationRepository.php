<?php

namespace App\Repositories;

use App\Models\Designation;
use App\Services\ODataService;

class DesignationRepository extends BaseRepository
{
    /**
     * @var Designation
     */
    protected $model;

    protected $request;

    protected $oDataService;

    protected $fieldSearchable = ['title', 'grade', 'description'];

    public function __construct()
    {
        $this->model         = new Designation();
    }
    protected function init()
    {
        $this->request      = request();
        $this->oDataService = (new ODataService())->init();
    }
}
