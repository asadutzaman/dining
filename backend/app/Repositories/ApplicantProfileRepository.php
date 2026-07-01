<?php

namespace App\Repositories;

use App\Models\ApplicantProfile;
use App\Services\ODataService;

class ApplicantProfileRepository extends BaseRepository
{
    /**
     * @var ApplicantProfile
     */
    protected $model;

    protected $request;

    protected $oDataService;

    protected $fieldSearchable = ['name_en', 'name_bn', 'national_id', 'mobile_no', 'email'];

    public function __construct()
    {
        $this->model         = new ApplicantProfile();
    }

    protected function init()
    {
        $this->request = request();
        $this->oDataService = (new ODataService())->init();
    }

    public function getDetailsByUserId($userId)
    {
        return $this->newQuery()
            ->where('user_id', $userId)
            ->first();
    }
}
