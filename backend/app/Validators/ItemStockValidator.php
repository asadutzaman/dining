<?php

namespace App\Validators;

class ItemStockValidator extends BaseValidator
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
                    'item_id' => ['required'],
                ];
            case 'PUT':
            case 'PATCH':
                return [
                    'item_id' => ['required'],
                ];
            default:
                break;
        }
    }

    public function messages()
    {
        $messages = parent::messages();

        $includesMessages = [
            'item_id.required'   => 'Item is required.',
        ];

        return array_merge($messages, $includesMessages);
    }

    public function attributes()
    {
        $attributes = parent::attributes();

        $includesAttributes = [
            'item_id' => 'Item',
        ];

        return array_merge($attributes, $includesAttributes);
    }
}
