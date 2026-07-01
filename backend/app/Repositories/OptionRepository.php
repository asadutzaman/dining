<?php

namespace App\Repositories;

use App\Models\Option;
use App\Services\ODataService;

class OptionRepository extends BaseRepository
{
    /**
     * @var Option
     */
    protected $model;

    protected $request;

    protected $oDataService;

    protected $fieldSearchable = ['key', 'value'];

    public function __construct()
    {
        $this->model         = new Option();
    }
    protected function init()
    {
        $this->request      = request();
        $this->oDataService = (new ODataService())->init();
    }

    public function loadOption()
    {
        $data = [];
        $result = $this->all();
        foreach ($result as $item) {
            $data[$item->key] = $item->value;
        }
        return $data;
    }

    public function getOptionByKey($key)
    {
        return $this->newQuery()
            ->where(['key' => $key])
            ->first();
    }

    public function getOptionValueByKey($key)
    {
        $result =  $this->newQuery()
            ->where(['key' => $key])
            ->first();

        return !empty($result) ? $result->value : '';
    }
}
