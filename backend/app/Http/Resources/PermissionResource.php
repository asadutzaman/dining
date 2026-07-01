<?php

namespace App\Http\Resources;

use App\Repositories\ResourceRepository;
use App\Repositories\ScopeRepository;

class PermissionResource extends BaseResource
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

        if (isset($data['scope_id'])) {
            $scopeRepository = new ScopeRepository();
            $scopeInfo = $scopeRepository->getScopeInfoById($data['scope_id']);
            $includesData['scope_key'] = $scopeInfo->scope ?? '';
            $includesData['scope_name'] = $scopeInfo->display_name ?? '';

            $includesData['component'] = '';

            $includesData['resource_id'] = '';
            $includesData['resource_name'] = '';
            $includesData['component'] = '';
            if (!empty($scopeInfo->resource_id)) {
                $resourceRepository = new ResourceRepository();
                $resourceInfo = $resourceRepository->getResourceInfoById($scopeInfo->resource_id);
                $includesData['resource_id'] = $resourceInfo->id ?? '';
                $includesData['resource_name'] = $resourceInfo->display_name ?? '';
                $includesData['component'] = $resourceInfo->component ?? '';
            }
        }

        return array_merge($data, $includesData);
    }
}
