<?php

namespace App\Repositories;

use App\Models\ApproverGroup;
use App\Services\ODataService;

class ApproverGroupRepository extends BaseRepository
{
    /**
    * @var ApproverGroup
    */
    protected $model;

    protected $request;

    protected $oDataService;

    protected $fieldSearchable = ['title', 'description'];

    public function __construct()
    {
       $this->model         = new ApproverGroup();
        }
 protected function init()
    {
        $this->request      = request();
        $this->oDataService = (new ODataService())->init();
    }
}
