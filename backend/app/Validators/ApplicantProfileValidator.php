<?php

namespace App\Validators;

class ApplicantProfileValidator extends BaseValidator
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
                   // 'email' => ['required'],
                  //  'mobile_no' => ['required'],

                ];
            case 'PUT':
            case 'PATCH':
                return [
                   // 'email' => ['required'],
                   // 'mobile_no' => ['required'],

                ];
            default:
                break;
        }
    }

    public function messages()
    {
        $messages = parent::messages();

        $includesMessages = [
          //  'email.required'   => 'Email is required.',
           // 'mobile_no.required'   => 'Mobile No. is required.',

        ];

        return array_merge($messages, $includesMessages);
    }

    public function attributes()
    {
        $attributes = parent::attributes();

        $includesAttributes = [
            //'email' => 'Email',
           // 'mobile_no' => 'Mobile No.',

        ];

        return array_merge($attributes, $includesAttributes);
    }

}
