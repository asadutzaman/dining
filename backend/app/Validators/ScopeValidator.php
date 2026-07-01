<?php

namespace App\Validators;

use Illuminate\Http\Request;

class ScopeValidator
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
                    'resource_id'         => ['required', 'integer'],
                    'scope'               => ['required', 'string'],
                    'display_name'        => ['required', 'string'],
                ];
            case 'PUT':
            case 'PATCH':
                return [
                    'resource_id'         => ['required', 'integer'],
                    'scope'               => ['required', 'string'],
                    'display_name'        => ['required', 'string'],
                ];
            default:
                break;
        }
    }

    public function messages()
    {
        return [
            'resource_id.required' => 'Resource is required.',
            'scope.required' => 'Scope Key is required.',
            'display_name.required' => 'Display name is required.',
        ];
    }

    public function attributes()
    {
        return [
            'resource_id' => 'Resource',
            'scope' => 'Scope Key',
            'display_name' => 'Display name',
        ];
    }
}
