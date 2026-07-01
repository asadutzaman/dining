<?php

namespace App\Validators;

class WorkflowValidator extends BaseValidator
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
                    'workflow_name' => ['required'],
                    'workflow_code' => ['required', 'unique:workflows,workflow_code,NULL,id,deleted_at,NULL'],
                    // 'type'         => ['required'],
                ];
            case 'PUT':
            case 'PATCH':
                return [
                    'workflow_name' => ['required'],
                    'workflow_code' => ['required'],
                    // 'type'         => ['required'],
                ];
            default:
                break;
        }
    }

    public function messages()
    {
        $messages = parent::messages();

        $includesMessages = [
            'workflow_name.required'   => 'Workflow Name is required.',
        ];

        return array_merge($messages, $includesMessages);
    }

    public function attributes()
    {
        $attributes = parent::attributes();

        $includesAttributes = [
            'workflow_code' => 'Workflow',
        ];

        return array_merge($attributes, $includesAttributes);
    }
}
