<?php

namespace App\Validators;

class OrganogramValidator extends BaseValidator
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
                    'name_en' => ['required'],
                    // 'name_bn' => ['required'],
                    // 'code'    => ['required'],
                ];
            case 'PUT':
            case 'PATCH':
                return [
                    'name_en' => ['required'],
                    // 'name_bn' => ['required'],
                    // 'code'    => ['required']
                ];
            default:
                break;
        }
    }

    public function messages()
    {
        $messages = parent::messages();

        $includesMessages = [
            'name_en.required'   => 'Name (English) is required.',
            // 'name_bn.required'   => 'Name (Bengali) is required.',
        ];

        return array_merge($messages, $includesMessages);
    }

    public function attributes()
    {
        $attributes = parent::attributes();

        $includesAttributes = [
            'name_en' => 'Name (English)',
            'name_bn' => 'Name (Bengali)',
        ];

        return array_merge($attributes, $includesAttributes);
    }
}
