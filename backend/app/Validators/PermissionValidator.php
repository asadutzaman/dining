<?php

namespace App\Validators;

use Illuminate\Http\Request;

class PermissionValidator
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
                    'scope_id' => ['required', 'integer'],
                    'role_id'  => ['required_without:user_id', 'integer'],
                    'user_id'  => ['required_without:role_id', 'integer']
                ];
            case 'PUT':
            case 'PATCH':
                return [
                    'scope_id' => ['required', 'integer'],
                    'role_id'  => ['required_without:user_id', 'integer'],
                    'user_id'  => ['required_without:role_id', 'integer']
                ];
            default:
                break;
        }
    }

    public function messages()
    {
        return [
            'scope_id.required' => 'Scope id is required.',
            'role_id.required_without'  => 'Role id is required.',
            'user_id.required_without'  => 'User id is required.'
        ];
    }

    public function attributes()
    {
        return [
            'scope_id' => 'Scope',
            'role_id'  => 'Role',
            'user_id'  => 'User'
        ];
    }

}
