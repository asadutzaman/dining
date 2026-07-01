<?php

namespace App\Http\Resources;

// use App\ApiService\Core\DesignationApiService;

use App\Repositories\BranchRepository;
use App\Repositories\DepartmentRepository;
use App\Repositories\DesignationRepository;
use App\Repositories\GroupRepository;
use App\Repositories\LogisticRepository;
use App\Repositories\RoleRepository;
use App\Repositories\UserRepository;
use App\Repositories\UserSettingRepository;
// use App\Services\ApiHelperService;
// use App\Services\ArrayService;
use App\Services\ParseService;
use GuzzleHttp\Promise;
use Illuminate\Support\Facades\Log;

class UserResource extends BaseResource
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

        $data = [
            'id'                     => $this->id,
            'first_name'             => $this->first_name,
            'last_name'              => $this->last_name,
            'email'                  => $this->email,
            'user_type'              => $this->user_type,
            'phone'                  => $this->phone,
            'designation_id'         => $this->designation_id,
            'logistic_id'            => $this->logistic_id,
            'branch_id'              => $this->branch_id,
            'department_id'          => $this->department_id,
            'role_ids'               => $this->role_ids,
            'organization_ids'       => $this->organization_ids,
            'organogram_ids'         => $this->organogram_ids,
            'created_at'             => $this->created_at,
            'updated_at'             => $this->updated_at,
            'status'                 => $this->status,
            'organization_name_list' => $baseData['organization_name_list'],
            'organogram_name_list'   => $baseData['organogram_name_list'],
            'created_by_name'        => $baseData['created_by_name'],
            'updated_by_name'        => $baseData['updated_by_name'],
            'employee_id'            => $this->employee_id,
        ];

        $includesData = [];

        if (isset($this->first_name)) {
            $includesData['name'] = $this->name ?? $this->first_name . ' ' . $this->last_name;
        }

        if (isset($this->uuid)) {
            $userSettingRepository = new UserSettingRepository();
            $userSettingInfo = $userSettingRepository->getUserSetting($this->id);

            $includesData['web_device_token'] = $userSettingInfo->web_device_token ?? '';
            $includesData['mobile_device_token'] = $userSettingInfo->mobile_device_token ?? '';
            $includesData['email_notification'] = $userSettingInfo->email_notification ?? '';
            $includesData['sms_notification'] = $userSettingInfo->sms_notification ?? '';
            $includesData['mobile_push_notification'] = $userSettingInfo->mobile_push_notification ?? '';
            $includesData['web_push_notification'] = $userSettingInfo->web_push_notification ?? '';
        }

        if (isset($this->role_ids)) {
            // $userRepository = new UserRepository();
            // $groupRepository = new GroupRepository();

            // $groupNameList = $groupRepository->getGroupNameList($this->group_ids);
            // $groupCodeList = $groupRepository->getGroupCodeList($this->group_ids);
            // $includesData['group_name_list'] = $groupNameList;
            // $includesData['group_code_list'] = $groupCodeList;

            // $roleIds = $userRepository->getUserRoleIds($this->id);
            // $includesData['role_ids'] = $roleIds;

            $roleRepository = new RoleRepository();
            $includesData['role_name_list'] = $roleRepository->getRoleNameList($this->role_ids);
            $includesData['role_code_list'] = $roleRepository->getRoleCodeList($this->role_ids);
        }

        if ($this->designation_id) {
            $designationRepository = new DesignationRepository();
            $designationInfo = $designationRepository->findById($this->designation_id);
            $includesData['designation_name'] = $designationInfo->title ?? '';
        }

        if ($this->department_id) {
            $departmentRepository = new DepartmentRepository();
            $departmentInfo = $departmentRepository->findById($this->department_id);
            $includesData['department_name'] = $departmentInfo->name ?? '';
        }

        if ($this->logistic_id) {
            $logisticRepository = new LogisticRepository();
            $logisticInfo = $logisticRepository->findById($this->logistic_id);
            $includesData['logistic_name'] = $logisticInfo->name ?? '';
        }

        if ($this->branch_id) {
            $branchRepository = new BranchRepository();
            $branchInfo = $branchRepository->findById($this->branch_id);
            $includesData['branch_name'] = $branchInfo->name ?? '';
        }

        return array_merge($data, $includesData);
    }

    private function dataCasts($includesData)
    {
        $data = [];

        $intKeys = [];

        $decimalKeys = [];

        $dateTimeKeys = [];

        foreach ($includesData as $key => $value) {
            if (in_array($key, $intKeys)) {
                $data[$key] = ParseService::parseInt($value);
            } else if (in_array($key, $decimalKeys)) {
                $data[$key] = ParseService::parseDecimal($value);
            } else if (in_array($key, $dateTimeKeys)) {
                $data[$key] = ParseService::parseDateTime($value);
            } else {
                $data[$key] = ParseService::parseString($value);
            }
        }

        return $data;
    }

    /*public static function withApiRelationalData($resource)
    {
        $promises = [];

        // Designation - Drive Table
        if (ArrayService::findKey($resource, 'designation_id')) {
            $designationApiService = new DesignationApiService();
            $promises['designation_info'] = $designationApiService->getPromiseRequest($resource, 'designation_id');
        }

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
    }*/
}
