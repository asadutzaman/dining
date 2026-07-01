<?php

namespace App\Http\Resources;

use App\Repositories\BranchRepository;
use App\Repositories\BrandRepository;

class BranchResource extends BaseResource
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

        if (isset($baseData['parent_id'])) {

            $BranchRepository = new BranchRepository();
            $BranchInfo = $BranchRepository->getBranchInfoById($baseData['parent_id']);

            $includesData['parent_name'] = $BranchInfo->name ?? '';
        }
        return array_merge($baseData, $includesData);
    }
}
