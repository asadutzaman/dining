<?php

namespace App\Http\Resources;

use App\Repositories\UserRepository;
use App\Services\ParseService;

class RequestAccessResource extends BaseResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        $data = parent::toArray($request);

        $includesData = [];

        if (isset($data['first_name'])) {
            $includesData['name'] = $data['first_name'] . ' ' . $data['last_name'];
        }

        if (isset($data['uuid'])) {
            $userRepository = new UserRepository();
            $userInfo = $userRepository->getByDeviceId($data['id']);
            $userName = '';
            if (!empty($userInfo)) {
                $userName = $userInfo->first_name . ' ' . $userInfo->last_name;
            }

            $includesData['user_name'] = ParseService::parseString($userName);

        }

        return array_merge($data, $includesData);
    }
}
