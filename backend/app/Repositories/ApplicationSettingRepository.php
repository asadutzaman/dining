<?php

namespace App\Repositories;

use App\Models\ApplicationSetting;
use App\Services\ODataService;

class ApplicationSettingRepository extends BaseRepository
{
    /**
     * @var ApplicationSetting
     */
    protected $model;

    protected $request;

    protected $oDataService;

    protected $fieldSearchable = ['title', 'description'];

    public function __construct()
    {
        $this->model         = new ApplicationSetting();
    }

    protected function init()
    {
        $this->request      = request();
        $this->oDataService = (new ODataService())->init();
    }

    public function getOption($option)
    {
        return $this->model->where("option", $option)->first();
    }

    public function findAndUpdate($option, $value)
    {
        return $this->newQuery()->where("option", $option)->update(['value' => $value]);
    }

    public function getApplicationSettings($options = [])
    {
        $slotSettings = $this->newQuery()
            ->whereIn("option", $options)->get();

        return $slotSettings->pluck('value', 'option')->toArray();
    }
}
