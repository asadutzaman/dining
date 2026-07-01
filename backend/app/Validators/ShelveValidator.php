<?php

namespace App\Validators;

class ShelveValidator extends BaseValidator
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
                    'branch_id' => ['required'],
                    'name' => ['required', 'string'],
                ];
            case 'PUT':
            case 'PATCH':
                return [
                    'name' => ['required', 'string'],
                    'branch_id' => ['required'],
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
            'branch_id.required' => 'Branch ID is required.',
        ];

        return array_merge($messages, $includesMessages);
    }

    public function attributes()
    {
        $attributes = parent::attributes();

        $includesAttributes = [
            'name' => 'Name',
            'branch_id' => 'Branch ID',
        ];

        return array_merge($attributes, $includesAttributes);
    }
}
