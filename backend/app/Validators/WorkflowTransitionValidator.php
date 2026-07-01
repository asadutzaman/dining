<?php

namespace App\Validators;

class WorkflowTransitionValidator extends BaseValidator
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
                    'workflow_record_id'   => ['required'],
                    'workflow_id'          => ['required'],
                    'workflow_step_id'     => ['required'],
                    'workflow_action_name' => ['required'],
                ];
            case 'PUT':
            case 'PATCH':
                return [
                    'workflow_record_id'   => ['required'],
                    'workflow_id'          => ['required'],
                    'workflow_step_id'     => ['required'],
                    'workflow_action_name' => ['required'],
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
        ];

        return array_merge($messages, $includesMessages);
    }

    public function attributes()
    {
        $attributes = parent::attributes();

        $includesAttributes = [
            'name' => 'Name',
        ];

        return array_merge($attributes, $includesAttributes);
    }
}
