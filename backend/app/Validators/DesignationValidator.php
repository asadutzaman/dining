<?php

namespace App\Validators;

class DesignationValidator extends BaseValidator
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
                    'title' => ['required', 'string'],
                    'grade' => ['nullable', 'string'],
                    'description' => ['nullable', 'string'],
                ];
            case 'PUT':
            case 'PATCH':
                return [
                    'title' => ['required', 'string'],
                    'grade' => ['nullable', 'string'],
                    'description' => ['nullable', 'string'],
                ];
            default:
                break;
        }
    }

    public function messages()
    {
        $messages = parent::messages();

        $includesMessages = [
            'title.required'   => 'Designation Name is required.',
            'grade.regex' => 'Grade may only contain letters, numbers, spaces, and - _ & . , characters.',
            'description.regex' => 'Description may only contain letters, numbers, spaces, and - _ & . , characters.',
        ];

        return array_merge($messages, $includesMessages);
    }

    public function attributes()
    {
        $attributes = parent::attributes();

        $includesAttributes = [];

        return array_merge($attributes, $includesAttributes);
    }
}
