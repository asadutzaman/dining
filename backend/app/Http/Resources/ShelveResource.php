<?php

namespace App\Http\Resources;

use App\Repositories\BranchRepository;

class ShelveResource extends BaseResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        try {
            $baseData = parent::toArray($request);

            $includesData = [];

            if (isset($baseData['branch_id'])) {

                $BranchRepository = new BranchRepository();
                $BranchInfo = $BranchRepository->getBranchInfoById($baseData['branch_id']);

                $includesData['branch_name'] = $BranchInfo->name ?? '';
            }

            return array_merge($baseData, $includesData);
        } catch (\Exception $e) {
            return parent::toArray($request);
        }
    }
}
