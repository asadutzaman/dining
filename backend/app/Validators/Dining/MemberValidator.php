<?php

namespace App\Validators\Dining;

use App\Validators\BaseValidator;

class MemberValidator extends BaseValidator
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
            case 'PUT':
            case 'PATCH':
                return [
                    'member_type'      => ['required', 'in:STAFF,STUDENT'],
                    'name'             => ['required', 'string', 'max:255'],
                    'phone'            => ['nullable', 'string', 'max:20'],
                    'email'            => ['nullable', 'email', 'max:255'],
                    'rfid_card_number' => ['nullable', 'string', 'max:64'],
                    'department_id'    => ['required_if:member_type,STAFF', 'nullable', 'integer'],
                    'designation_id'   => ['nullable', 'integer'],
                    'class_name'       => ['required_if:member_type,STUDENT', 'nullable', 'string', 'max:50'],
                    'section'          => ['nullable', 'string', 'max:50'],
                    'roll_no'          => ['required_if:member_type,STUDENT', 'nullable', 'string', 'max:50'],
                ];
            default:
                break;
        }
    }

    public function messages()
    {
        $messages = parent::messages();

        $includesMessages = [
            'member_type.required'   => 'Member type is required.',
            'name.required'          => 'Name is required.',
            'department_id.required_if' => 'Department is required for staff.',
            'class_name.required_if'    => 'Class is required for students.',
            'roll_no.required_if'       => 'Roll number is required for students.',
        ];

        return array_merge($messages, $includesMessages);
    }

    public function attributes()
    {
        $attributes = parent::attributes();

        $includesAttributes = [
            'member_type' => 'Member Type',
            'name'        => 'Name',
        ];

        return array_merge($attributes, $includesAttributes);
    }

}
