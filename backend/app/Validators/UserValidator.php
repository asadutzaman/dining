<?php

namespace App\Validators;

use Illuminate\Http\Request;

class UserValidator
{
    protected $request;

    public function __construct(Request $request)
    {
        $this->request = $request;
    }

    public function rules()
    {
        switch ($this->request->method()) {
            case 'GET':
            case 'DELETE':
                return [];

            case 'POST':
                return [
                    'name' => ['required', 'string'],
                    'role_ids'    => ['required'],
                    'email' => ['required_without:phone', 'email', 'unique:users,email,NULL,id,deleted_at,NULL'],
                    'phone' => ['required_without:email', 'unique:users,phone,NULL,id,deleted_at,NULL'],
                    'password'   => ['required', 'string', 'min:6']
                ];
            case 'PUT':
            case 'PATCH':
                $id = $this->request->id;
                return [
                    'name' => ['required', 'string'],
                    'email' => ['required_without:phone', 'email', 'unique:users,email,' . $id . ',id,deleted_at,NULL'],
                    'phone' => ['required_without:email', 'unique:users,phone,' . $id . ',id,deleted_at,NULL'],
                ];
            default:
                break;
        }
    }

    public function messages()
    {
        return [
            'name.required'          => 'Name is required.',
            'username.required'      => 'User Name is required.',
            'email.required_without' => 'Please enter your email address or phone number.',
            'phone.required_without' => 'Please enter your phone number or email address.',
        ];
    }

    public function attributes()
    {
        return [
            'name'     => 'Name',
            'username' => 'User Name',
            'email'    => 'Email',
        ];
    }
}
