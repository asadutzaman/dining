<?php

namespace App\Validators;

class ExampleValidator extends BaseValidator
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
                    'title' => ['required'],
                    // 'name_bn' => ['required'],
                ];
            case 'PUT':
            case 'PATCH':
                return [
                    'title' => ['required'],
                    // 'name_bn' => ['required']
                ];
            default:
                break;
        }
    }

    public function messages()
    {
        $messages = parent::messages();

        $includesMessages = [
            'title.required'   => 'Title is required.',
            // 'name_bn.required'   => 'Name (Bengali) is required.',
        ];

        return array_merge($messages, $includesMessages);
    }

    public function attributes()
    {
        $attributes = parent::attributes();

        $includesAttributes = [
            'title' => 'Title',
            // 'name_bn' => 'Name (Bengali)',
        ];

        return array_merge($attributes, $includesAttributes);
    }
}
