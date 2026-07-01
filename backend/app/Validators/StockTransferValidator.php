<?php

namespace App\Validators;

class StockTransferValidator extends BaseValidator
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
                    'reason' => ['nullable', 'string'],
                    'transfer_from' => ['required', 'exists:branches,id'],
                    'transfer_to' => ['required', 'exists:branches,id'],
                    'stockTransferItemsList' => ['required', 'array'],
                    'process_status' => ['required']
                ];
            case 'PUT':
            case 'PATCH':
                return [
                    'reason' => ['nullable', 'string'],
                    'transfer_from' => ['required', 'exists:branches,id'],
                    'transfer_to' => ['required', 'exists:branches,id'],
                    'stockTransferItemsList' => ['required', 'array'],
                    'process_status' => ['required']
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
            // 'stock_transfer_number' => 'Stock Transfer Number',
        ];

        return array_merge($attributes, $includesAttributes);
    }
}
