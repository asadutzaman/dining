<?php

namespace App\Validators;

class BranchValidator extends BaseValidator
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
                    'type' => ['required', 'string'],
                    'name' => ['required', 'string'],
                    'address' => ['required', 'string'],
                ];
            case 'PUT':
            case 'PATCH':
                return [
                    'type' => ['required', 'string'],
                    'name' => ['required', 'string'],
                    'address' => ['required', 'string'],
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
            'address.required'   => 'Address is required.',
            'type.required'   => 'Type is required.',
        ];

        return array_merge($messages, $includesMessages);
    }

    public function attributes()
    {
        $attributes = parent::attributes();

        $includesAttributes = [
            'name' => 'Name',
            'address' => 'Address',
            'type' => 'Type',
        ];

        return array_merge($attributes, $includesAttributes);
    }
}
