<?php

namespace App\Validators;

class LogisticValidator extends BaseValidator
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
                    'name' => ['required', 'string'],
                    'code' => ['required'],
                    'description' => ['nullable', 'string'],
                ];
            case 'PUT':
            case 'PATCH':
                return [
                    'name' => ['required', 'string'],
                    'code' => ['required'],
                    'description' => ['nullable', 'string'],
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
            'code.required'   => 'Code is required.',
            'description.regex' => 'Description may only contain letters, numbers, spaces, and - _ & . , characters.',
        ];

        return array_merge($messages, $includesMessages);
    }

    public function attributes()
    {
        $attributes = parent::attributes();

        $includesAttributes = [
            'name' => 'Name',
            'code' => 'Code',
            'description' => 'Description',
        ];

        return array_merge($attributes, $includesAttributes);
    }
}
