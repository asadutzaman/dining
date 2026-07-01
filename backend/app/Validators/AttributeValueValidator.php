<?php

namespace App\Validators;

class AttributeValueValidator extends BaseValidator
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
                    'value' => ['required'],
                ];
            case 'PUT':
            case 'PATCH':
                return [
                    'value' => ['required'],
                ];
            default:
                break;
        }
    }

    public function messages()
    {
        $messages = parent::messages();

        $includesMessages = [
            'value.required'   => 'Attribute Value is required.',
        ];

        return array_merge($messages, $includesMessages);
    }

    public function attributes()
    {
        $attributes = parent::attributes();

        $includesAttributes = [
            'value' => 'Attribute Value',
        ];

        return array_merge($attributes, $includesAttributes);
    }
}
