<?php

namespace App\Validators;

class SupplierValidator extends BaseValidator
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
                    'supplier_name' => ['required'],
                    'phone'         => ['required'],
                ];
            case 'PUT':
            case 'PATCH':
                return [
                    'supplier_name' => ['required'],
                    'phone'         => ['required'],
                ];
            default:
                break;
        }
    }

    public function messages()
    {
        $messages = parent::messages();

        $includesMessages = [
            'supplier_name.required'   => 'Supplier Name is required.',
            'phone.required'           => 'Phone Number is required.',
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
