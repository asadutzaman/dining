<?php

namespace App\Validators;

use Illuminate\Validation\Rule;

class PatientValidator extends BaseValidator
{
    protected $request;

    public function __construct()
    {
        $this->request = request();
    }

    public function rules()
    {
        $id = $this->request->route('id');

        switch ($this->request->method()) {
            case 'GET':
            case 'DELETE':
                return [];

            case 'POST':
                return [
                    'first_name'    => ['required'],
                    'last_name'     => ['required'],
                    'date_of_birth' => ['required', 'date'],
                    'gender'        => ['required', Rule::in(['male', 'female', 'other', 'unknown'])],
                    'primary_phone' => ['required', 'unique:patients,primary_phone'],
                ];

            case 'PUT':
            case 'PATCH':
                return [
                    'first_name'    => ['required'],
                    'last_name'     => ['required'],
                    'date_of_birth' => ['required', 'date'],
                    'gender'        => ['required', Rule::in(['male', 'female', 'other', 'unknown'])],
                    'primary_phone' => ['required', Rule::unique('patients', 'primary_phone')->ignore($id)],
                ];

            default:
                return [];
        }
    }

    public function messages()
    {
        $messages = parent::messages();

        $includesMessages = [
            'first_name.required'    => 'First name is required.',
            'last_name.required'     => 'Last name is required.',
            'date_of_birth.required' => 'Date of birth is required.',
            'date_of_birth.date'     => 'Date of birth must be a valid date.',
            'gender.required'        => 'Gender is required.',
            'gender.in'              => 'Gender must be one of: male, female, other, unknown.',
            'primary_phone.required' => 'Primary phone is required.',
            'primary_phone.unique'   => 'A patient with this phone number already exists.',
        ];

        return array_merge($messages, $includesMessages);
    }

    public function attributes()
    {
        $attributes = parent::attributes();

        $includesAttributes = [
            'first_name'    => 'First Name',
            'last_name'     => 'Last Name',
            'date_of_birth' => 'Date of Birth',
            'gender'        => 'Gender',
            'primary_phone' => 'Primary Phone',
        ];

        return array_merge($attributes, $includesAttributes);
    }
}
