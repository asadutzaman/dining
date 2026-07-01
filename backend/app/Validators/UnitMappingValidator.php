<?php

namespace App\Validators;

class UnitMappingValidator extends BaseValidator
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
                    'item_id'            => ['required'],
                    'unit_id'            => ['required'],
                    'conversion_to_base' => ['required'],
                ];
            case 'PUT':
            case 'PATCH':
                return [
                    'item_id'            => ['required'],
                    'unit_id'            => ['required'],
                    'conversion_to_base' => ['required'],
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
