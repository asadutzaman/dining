<?php

namespace App\Validators;

class UnitValidator extends BaseValidator
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
                    'short_name' => ['required', 'unique:units,short_name,NULL,id,deleted_at,NULL'],
                ];
            case 'PUT':
            case 'PATCH':
                $id = $this->request->id;
                return [
                    'name' => ['required', 'string'],
                    'short_name' => ['required', 'unique:units,short_name,' . $id . ',id,deleted_at,NULL'],
                ];
            default:
                break;
        }
    }

    public function messages()
    {
        $messages = parent::messages();

        $includesMessages = [
            'name.required'       => 'Unit name is required.',
            'short_name.required' => 'Short name is required.',
        ];

        return array_merge($messages, $includesMessages);
    }

    public function attributes()
    {
        $attributes = parent::attributes();

        $includesAttributes = [
            'name' => 'Unit name',
            'short_name' => 'Short name',
        ];

        return array_merge($attributes, $includesAttributes);
    }
}
