<?php

namespace App\Validators;

use Illuminate\Validation\Rules\Enum;
use App\Enums\RequisitionProcessStatusEnum;


class RequisitionValidator extends BaseValidator
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
                    'subject' => ['required', 'string'],
                    'process_status' => ['required'],
                    'description' => ['nullable', 'string'],
                    'requisitionItemsList' => ['required', 'array']

                ];
            case 'PUT':
            case 'PATCH':
                return [
                    'subject' => ['required', 'string'],
                    'process_status' => ['required'],
                    'description' => ['nullable', 'string'],
                    'requisitionItemsList' => ['required', 'array']
                ];
            default:
                break;
        }
    }

    public function messages()
    {
        $messages = parent::messages();

        $includesMessages = [
            'subject.required'   => 'Subject is required.',
            'process_status.required'   => 'Process Status is required.',
            'description.required' => 'Description may only contain letters, numbers, spaces, and - _ & . , characters.',
        ];

        return array_merge($messages, $includesMessages);
    }

    public function attributes()
    {
        $attributes = parent::attributes();

        $includesAttributes = [
            'subject' => 'Subject',
            'process_status' => 'Process Status',
            'description' => 'Description',
        ];

        return array_merge($attributes, $includesAttributes);
    }
}
