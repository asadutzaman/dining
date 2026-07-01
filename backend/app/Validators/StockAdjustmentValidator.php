<?php

namespace App\Validators;

class StockAdjustmentValidator extends BaseValidator
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
                    'adjustment_type' => ['required'],
                    'reason' => ['nullable', 'string'],
                    'stockAdjustmentItemsList' => ['required', 'array']
                ];
            case 'PUT':
            case 'PATCH':
                return [
                    'adjustment_type' => ['required'],
                    'reason' => ['nullable', 'string'],
                    'stockAdjustmentItemsList' => ['required', 'array']
                ];
            default:
                break;
        }
    }

    public function messages()
    {
        $messages = parent::messages();

        $includesMessages = [
            'reason.regex' => 'Reason may only contain letters, numbers, spaces, and - _ & . , characters.',
        ];

        return array_merge($messages, $includesMessages);
    }

    public function attributes()
    {
        $attributes = parent::attributes();

        $includesAttributes = [
            'reason' => 'Reason',
        ];

        return array_merge($attributes, $includesAttributes);
    }
}
