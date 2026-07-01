<?php

namespace App\Validators;

class ApproverGroupValidator extends BaseValidator
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
                    'workflow_code'           => ['required', 'string', 'unique:approver_groups,workflow_code,NULL,id,deleted_at,NULL'],
                    'name'                    => ['required', 'string'],
                    'description'             => ['nullable', 'string'],
                    'approverGroupMemberList' => ['required', 'array'],
                ];
            case 'PUT':
            case 'PATCH':
                $id = $this->request->id;
                return [
                    'workflow_code'           => ['required', 'string', 'unique:approver_groups,workflow_code,' . $id . ',id,deleted_at,NULL'],
                    'name'                    => ['required', 'string'],
                    'description'             => ['nullable', 'string'],
                    'approverGroupMemberList' => ['required', 'array'],
                ];
            default:
                break;
        }
    }

    public function messages()
    {
        $messages = parent::messages();

        $includesMessages = [
            'name.required'   => 'Name is required.',
            'description.regex' => 'Description may only contain letters, numbers, spaces, and - _ & . , characters.',
        ];

        return array_merge($messages, $includesMessages);
    }

    public function attributes()
    {
        $attributes = parent::attributes();

        $includesAttributes = [
            'name' => 'Name',
            'description' => 'Description'
        ];

        return array_merge($attributes, $includesAttributes);
    }
}
