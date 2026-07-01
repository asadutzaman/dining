<?php

namespace App\Validators;

class StockAdjustmentItemValidator extends BaseValidator
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
                    'remarks' => ['nullable', 'string'],
                ];
            case 'PUT':
            case 'PATCH':
                return [
                    'item_id' => ['required'],
                    'remarks' => ['nullable', 'string'],
                ];
            default:
                break;
        }
    }

    public function messages()
    {
        $messages = parent::messages();

        $includesMessages = [
            'item_id.required'   => 'Item id is required.',
            'remarks.regex' => 'Remarks may only contain letters, numbers, spaces, and - _ & . , characters.',
        ];

        return array_merge($messages, $includesMessages);
    }

    public function attributes()
    {
        $attributes = parent::attributes();

        $includesAttributes = [
            'item_id' => 'Item',
            'remarks' => 'Remarks',
        ];

        return array_merge($attributes, $includesAttributes);
    }
}
