<?php

namespace App\Validators;

class RequisitionItemLimitValidator extends BaseValidator
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
                    'designation_id' => ['required', 'integer', 'exists:designations,id'],
                    'item_id'        => ['nullable', 'integer', 'exists:items,id'],
                    'item_ids'       => ['nullable', 'array'],
                    'item_ids.*'     => ['integer', 'exists:items,id'],
                    'limit_type'     => ['required', 'string', 'in:MONTHLY,YEARLY'],
                    'max_qty'        => ['required', 'numeric', 'min:0'],
                    'effective_from' => ['required', 'date'],
                ];
            case 'PUT':
            case 'PATCH':
                return [
                    'designation_id' => ['required', 'integer', 'exists:designations,id'],
                    'item_id'        => ['required', 'integer', 'exists:items,id'],
                    'limit_type'     => ['required', 'string', 'in:MONTHLY,YEARLY'],
                    'max_qty'        => ['required', 'numeric', 'min:0'],
                    'effective_from' => ['required', 'date'],
                ];
            default:
                break;
        }
    }

    public function messages()
    {
        $messages = parent::messages();

        $includesMessages = [
            'designation_id.required' => 'Designation is required.',
            'designation_id.exists'   => 'Designation not found.',
            'item_id.exists'          => 'Item not found.',
            'limit_type.required'     => 'Limit type is required.',
            'limit_type.in'           => 'Limit type must be MONTHLY or YEARLY.',
            'max_qty.required'        => 'Max quantity is required.',
            'max_qty.numeric'         => 'Max quantity must be numeric.',
            'effective_from.required' => 'Effective from date is required.',
        ];

        return array_merge($messages, $includesMessages);
    }

    public function attributes()
    {
        $attributes = parent::attributes();

        $includesAttributes = [
            'designation_id' => 'Designation',
            'item_id'        => 'Item',
            'item_ids'       => 'Items',
            'limit_type'     => 'Limit Type',
            'max_qty'        => 'Max Quantity',
            'effective_from' => 'Effective From',
        ];

        return array_merge($attributes, $includesAttributes);
    }

}
