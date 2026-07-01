<?php

namespace App\Http\Resources;

use GuzzleHttp\Promise;
use App\Services\ArrayService;
use App\Services\ApiHelperService;
use App\Repositories\OrganizationRepository;

class OrganizationResource extends BaseResource
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

        if (isset($data['parent_id'])) {
            $organizationRepository = new OrganizationRepository();
            $organizationInfo = $organizationRepository->getOrganizationInfoById($data['parent_id']);
            $includesData['parent_en'] = $organizationInfo->name_en ?? '';
            $includesData['parent_bn'] = $organizationInfo->name_bn ?? '';
        }

        return array_merge($data, $includesData);
    }


    public static function withApiRelationalData($resource)
    {
        $promises = [];
        if (ArrayService::findKey($resource, 'component_ids')) {
            // Remove empty element in array
            $promises = ArrayService::removeEmptyElements($promises);
            if (empty($promises)) {
                return $resource;
            }

            // Process promise response
            $responses = Promise\unwrap($promises);
            $responses = Promise\settle($promises)->wait(true);

            // Get promise response
            $components = ApiHelperService::getPromiseResponse($responses, 'component');
            $resource = self::appendOrganizationData($resource, $components);
        }
        return $resource;
    }

    public static function appendOrganizationData($resource, $components)
    {
        if (empty($components)) {
            return $resource;
        }
        $isCollection = isset($resource[0]) && is_array($resource[0]) ? true : false;
        if ($isCollection) {;
            foreach ($resource as $key => $item) {
                $nameEn = '';
                $nameBn = '';
                $shortName = [];
                $IDs = $item['component_ids'] ?? [];
                foreach ($components as $component) {
                    if (in_array($component['id'], $IDs)) {
                        $nameEn .= $component['name_en'] . ', ';
                        $nameBn .= $component['name_bn'] . ', ';
                        $shortName[] = $component['key'];
                    }
                }
                $resource[$key]['component_name_en'] = $nameEn;
                $resource[$key]['component_name_bn'] = $nameBn;
                $resource[$key]['component_keys'] = $shortName;
            }
        } else {
            $nameEn = '';
            $nameBn = '';
            $shortName = [];
            $IDs = $resource['component_ids'] ?? [];
            foreach ($components as $component) {
                if (in_array($component['id'], $IDs)) {
                    $nameEn .= $component['name_en'] . ', ';
                    $nameBn .= $component['name_bn'] . ', ';
                    $shortName[] = $component['key'];
                }
            }
            $resource['component_name_en'] = $nameEn;
            $resource['component_name_bn'] = $nameBn;
            $resource['component_keys'] = $shortName;
        }
        return $resource;
    }
}
