<?php

namespace App\Http\Resources;

use App\Services\ResourceService;
use GuzzleHttp\Promise;
use App\Services\ArrayService;
use App\Services\ApiHelperService;

class ApplicantProfileResource extends BaseResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        return parent::toArray($request);
        // $data = parent::toArray($request);

        // $includesData = [];
        // $applicantProfileEducationalQualificationRepository = new ApplicantProfileEducationalQualificationRepository();
        // if (isset($data['uuid'])) {
        //     $educationalQualificationList = $applicantProfileEducationalQualificationRepository->getEducationalQualificationByApplicantId($data['id']);
        //     $educationalQualificationListTo = ResourceService::getResourceCollection($educationalQualificationList, ApplicantProfileEducationalQualificationResource::class);
        //     $includesData['educational_qualification'] = $educationalQualificationListTo;
        // }
        // return array_merge($data, $includesData);
    }

    public static function withApiRelationalData($resource)
    {
        $promises = [];

        // Remove empty element in array
        $promises = ArrayService::removeEmptyElements($promises);
        if (empty($promises)) {
            return $resource;
        }

        // Process promise response
        $responses = Promise\unwrap($promises);
        $responses = Promise\settle($promises)->wait();

        // Drive Table Response
        $resource = ApiHelperService::appendPromiseResponse(
            $resource,
            $responses,
            'home_district',
            'home_district_id',
            'id',
            ['home_district_name_en' => 'name_en', 'home_district_name_bn' => 'name_bn']
        );
        // Drive Table Response
        $resource = ApiHelperService::appendPromiseResponse(
            $resource,
            $responses,
            'present_division',
            'present_division_id',
            'id',
            ['present_division_name_en' => 'name_en', 'present_division_name_bn' => 'name_bn']
        );
        // Drive Table Response
        $resource = ApiHelperService::appendPromiseResponse(
            $resource,
            $responses,
            'present_district',
            'present_district_id',
            'id',
            ['present_district_name_en' => 'name_en', 'present_district_name_bn' => 'name_bn']
        );
        // Drive Table Response
        $resource = ApiHelperService::appendPromiseResponse(
            $resource,
            $responses,
            'present_upazila',
            'present_upazila_id',
            'id',
            ['present_upazila_name_en' => 'name_en', 'present_upazila_name_bn' => 'name_bn']
        );

        return $resource;
    }
}
