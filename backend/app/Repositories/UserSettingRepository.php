<?php

namespace App\Repositories;

use App\Models\UserSetting;
use App\Services\ODataService;

class UserSettingRepository extends BaseRepository
{
    /**
     * @var UserSetting
     */
    protected $model;

    protected $request;

    protected $oDataService;

    protected $fieldSearchable = [];

    public function __construct()
    {
        $this->model        = new UserSetting();
    }
    protected function init()
    {
        $this->request      = request();
        $this->oDataService = (new ODataService())->init();
    }

    public function getUserSetting($userId)
    {
        return $this->findBy('user_id', $userId);
    }

    public function updateUserDeviceToken($userId, $deviceType, $deviceToken)
    {
        $userSettingInfo = $this->getUserSetting($userId);
        if (empty($userSettingInfo)) {
            $this->newQuery()
                ->create([
                    'user_id' => $userId,
                    'web_device_token' => null,
                    'mobile_device_token' => null,
                    'email_notification' => 1,
                    'sms_notification' => 1,
                    'mobile_push_notification' => 1,
                    'web_push_notification' => 1,
                ]);
        }

        if ($deviceType == 'web') {
            $this->newQuery()
                ->where(['web_device_token' => $deviceToken])
                ->update([
                    'web_device_token' => null,
                ]);

            $this->newQuery()
                ->where(['user_id' => $userId])
                ->update(['web_device_token' => $deviceToken]);
        } else if ($deviceType == 'mobile') {
            $this->newQuery()
                ->where(['mobile_device_token' => $deviceToken])
                ->update([
                    'mobile_device_token' => null
                ]);

            $this->newQuery()
                ->where(['user_id' => $userId])
                ->update(['mobile_device_token' => $deviceToken]);
        }
    }
}
