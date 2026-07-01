<?php

namespace App\Http\Resources;

use App\Repositories\RoleRepository;
use App\Repositories\UserRepository;

class GroupResource extends BaseResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        $baseData = parent::toArray($request);

        $includesData = [];

        if (isset($baseData['role_ids'])) {
            $roleRepository = new RoleRepository();
            $includesData['role_name_list'] = $roleRepository->getRoleNameList($baseData['role_ids']);
        }

        return array_merge($baseData, $includesData);
    }
}
