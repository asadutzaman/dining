<?php

namespace App\Http\Resources;

use App\Repositories\OrganogramRepository;
use App\Repositories\OrganogramSanctionPostRepository;
use App\Services\ResourceService;

class OrganogramResource extends BaseResource
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

        // $organogramSanctionPostRepository = new OrganogramSanctionPostRepository();

        // if (isset($data['uuid'])) {
        //     $organogramSanctionPostListData = $organogramSanctionPostRepository->getOrganogramSanctionPostId($data['id']);
        //     $organogramSanctionPostListData = ResourceService::getResourceCollection($organogramSanctionPostListData, OrganogramSanctionPostResource::class);
        //     $includesData['organogramSacntionPostListData'] = $organogramSanctionPostListData;
        // }


        // echo "<pre>";
        // print_r($data);
        // echo "</pre>";
        // exit();

        if (isset($data['parent_id'])) {




            $OrganogramRepository = new OrganogramRepository();
            $OrganogramInfo = $OrganogramRepository->getOrganogramInfoById($data['parent_id']);

            $includesData['parent_en'] = $OrganogramInfo->name_en ?? '';
            $includesData['parent_bn'] = $OrganogramInfo->name_bn ?? '';
        }


        // if (isset($data['parent_id'])) {
        //     $OrganogramRepository = new OrganogramRepository();
        //     $OrganogramInfo = $OrganogramRepository->getOrganogramInfoById($data['parent_id']);
        //     $includesData['parent_en'] = $OrganogramInfo->name_en;
        //     $includesData['parent_bn'] = $OrganogramInfo->name_bn;
        // }

        // if (isset($data['country_id'])) {
        //     $includesData['country_name_en'] = 'Bangladesh';
        //     $includesData['country_name_bn'] = 'Bangladesh';
        // }
        // if (isset($data['division_id'])) {
        //     $includesData['division_name_en'] = 'Dhaka';
        //     $includesData['division_name_bn'] = 'Dhaka';
        // }
        // if (isset($data['district_id'])) {
        //     $includesData['district_name_en'] = 'Gazipur';
        //     $includesData['district_name_bn'] = 'Gazipur';
        // }
        // if (isset($data['thana_id'])) {
        //     $includesData['thana_name_en'] = 'Kaliganj';
        //     $includesData['thana_name_bn'] = 'Kaliganj';
        // }
        return array_merge($data, $includesData);
    }
}
