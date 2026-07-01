<?php

namespace App\Http\Resources;

use App\Repositories\ResourceRepository;
use App\Services\ParseService;

class ScopeResource extends BaseResource
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

        if (isset($data['resource_id'])) {
            $resourceRepository = new ResourceRepository();
            $resourceName = $resourceRepository->getResourceNameById($data['resource_id']);
            $includesData['resource_name'] = ParseService::parseString($resourceName);
        }

        return array_merge($data, $includesData);
    }

}
