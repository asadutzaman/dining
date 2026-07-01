<?php

namespace App\Repositories;

use App\Models\Brand;
use App\Services\ODataService;

class BrandRepository extends BaseRepository
{
    /**
     * @var Brand
     */
    protected $model;

    protected $request;

    protected $oDataService;

    protected $fieldSearchable = ['name', 'description'];

    public function __construct()
    {
        $this->model         = new Brand();
    }
    protected function init()
    {
        $this->request      = request();
        $this->oDataService = (new ODataService())->init();
    }
}
