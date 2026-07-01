<?php

namespace App\Http\Resources;

use App\Repositories\OrganizationRepository;
use App\Services\ApiHelperService;
use App\Services\ArrayService;
use GuzzleHttp\Promise;

class EmployeeResource extends BaseResource
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

        $organizationRepository = new OrganizationRepository();

        if (isset($data['organization_id'])) {
            $organizationInfo = $organizationRepository->getById($data['organization_id']);
            $includesData['organization_en'] = $organizationInfo->name_en ?? '';
            $includesData['organization_bn'] = $organizationInfo->name_bn ?? '';
        }

        return array_merge($data, $includesData);
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

        // Designation - Drive Table
        $resource = ApiHelperService::appendPromiseResponse($resource, $responses, 'designation_info', 'designation_id', 'id', ['designation_name_en' => 'name_en', 'designation_name_bn' => 'name_bn']);

        return $resource;
    }
}
