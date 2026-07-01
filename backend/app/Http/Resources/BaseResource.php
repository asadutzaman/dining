<?php

namespace App\Http\Resources;

use Illuminate\Support\Arr;
use App\Repositories\UserRepository;
use App\Repositories\OrganogramRepository;
use App\Repositories\OrganizationRepository;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Log;

class BaseResource extends JsonResource
{
    protected $isCollection;

    private static $user;

    private static $location;

    public function __construct($resource, $isCollection = false)
    {
        parent::__construct($resource);
        $this->isCollection = $isCollection; // Set the flag
    }

    public function toArray($request)
    {
        try {
            $data = parent::toArray($request);

            $includesData = [];

            if (isset($data['organization_ids'])) {
                $organizationRepository = new OrganizationRepository();
                $organizations = $organizationRepository->getOrganizationNameListByIds($data['organization_ids']);

                $includesData['organization_name_list'] = $organizations;
            }
            if (isset($data['organogram_ids'])) {
                $organogramRepository = new OrganogramRepository();
                $organograms = $organogramRepository->getOrganogramNameListById($data['organogram_ids']);
                $includesData['organogram_name_list'] = $organograms;
            }
            if (isset($data['created_by'])) {
                $userRepository = new UserRepository();
                $includesData['created_by_name'] = $userRepository->getUserNameById($data['created_by']);
                $includesData['created_by_designation'] = $userRepository->getUserDesignationById($data['created_by']) ?? '';
            }
            if (isset($data['updated_by'])) {
                $userRepository = new UserRepository();
                $includesData['updated_by_name'] = $userRepository->getUserNameById($data['updated_by']);
            }
            return array_merge($data, $includesData);
        } catch (\Exception $e) {
            return parent::toArray($request);
        }
    }

    public static function withApiRelationalData($resource)
    {
        return $resource;
    }
}
