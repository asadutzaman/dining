<?php

namespace App\Validators;

class ApproverGroupMemberValidator extends BaseValidator
{
    protected $request;

    public function __construct()
    {
        $this->request = request();
    }

    public function rules()
    {
        switch ($this->request->method()) {
            case 'GET':
            case 'DELETE':
                return [];

            case 'POST':
                return [
                    'approver_group_id' => ['required'],
                    'user_id' => ['required']
                ];
            case 'PUT':
            case 'PATCH':
                return [
                    'approver_group_id' => ['required'],
                    'user_id' => ['required']
                ];
            default:
                break;
        }
    }

    public function messages()
    {
        $messages = parent::messages();

        $includesMessages = [
            'approver_group_id.required'   => 'Approver Group ID is required.',
            'user_id.required' => 'User ID is required.'
        ];

        return array_merge($messages, $includesMessages);
    }

    public function attributes()
    {
        $attributes = parent::attributes();

        $includesAttributes = [
            'approver_group_id' => 'Approver Group ID',
            'user_id' => 'User ID'
        ];

        return array_merge($attributes, $includesAttributes);
    }
}
