<?php

namespace App\Repositories;

use App\Models\Enum;
use App\Services\ODataService;

class EnumRepository extends BaseRepository
{
    /**
     * @var Enum
     */
    protected $model;

    protected $request;

    protected $oDataService;

    protected $fieldSearchable = ['key', 'value'];

    public function __construct()
    {
        $this->model         = new Enum();
    }
    protected function init()
    {
        $this->request      = request();
        $this->oDataService = (new ODataService())->init();
    }

    public function getValueByKey($key)
    {
        return $this->newQuery()
            ->firstWhere('key', $key);
    }
}
