<?php

namespace App\Validators;

class AttributeValidator extends BaseValidator
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
                    'description' => ['nullable', 'string'],
                    'attributeValueList' => ['required', 'array'],
                ];
            case 'PUT':
            case 'PATCH':
                return [
                    'name' => ['required', 'string'],
                    'description' => ['nullable', 'string'],
                    'attributeValueList' => ['required', 'array'],
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
            'description' => 'Description',
        ];

        return array_merge($attributes, $includesAttributes);
    }
}
