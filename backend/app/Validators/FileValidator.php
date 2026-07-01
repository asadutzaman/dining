<?php

namespace App\Validators;

use App\Rules\UniqueEmail;
use Illuminate\Http\Request;

class FileValidator
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
                    'name'=>'required'
                ];
            case 'PUT':
            case 'PATCH':
                return [
                    'name'=>'required'
                ];
            default:
                /*return [
                    "title"         => 'required|string|min:3|max:150',
                    'title'         => ['required', 'string', 'max:255'],
                    'name'          => ['required', 'string', 'min:2', 'max:255', 'regex:/^[A-Za-z_ \-\'\.\,]+$/'],
                    'eventName'     => 'required|min:6|unique:events,eventName',
                    'slug'          => ['required', 'string', 'max:100', new Slug()],
                    'code'          => ['bail', 'nullable', 'sometimes', 'alpha_dash', 'max:20'],
                    'description'   => ['required', 'min:3', 'max:500'],
                    'body'          => 'required|spamfree|max:1500',
                    'tags'          => 'json|regex:/^(?!.*\s).+$/u|regex:/^(?!.*\/).*$/u',
                    'subject'       => 'required|min:5|max:50',
                    'message'       => 'required|min:15|max:500'

                    'email'         => ['required', 'string', 'email', 'max:255', new UniqueEmail],
                    'mobile'        => ['required', 'required', 'regex:^[6-9]\d{9}$^'],
                    'phone'         => 'required|min:10|max:11|regex:/^[0-9]{10,11}$/i',
                    'fax'           => 'nullable|min:10|max:11|regex:/^[0-9]{10,11}$/i',

                    'image'         => ['required', 'image'],
                    'avatar'        => 'mimes:jpeg,jpg,png|max:1000',
                    'image'         => 'required|mimes:jpeg,bmp,png|max:4000|image_size:>=300,>=300',
                    'pdf'           => "required|mimetypes:application/pdf|max:10000",

                    "date"          => "required|date_format:Y-m-d",
                    'start_date'    => 'required|date|after:today',
                    'end_date'      => 'required|date|after:start_date',
                    'create_date'   => 'required|regex:/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/',
                    'on_date'       => ['bail', 'required', 'date'],
                    'from_date'     => ['bail', 'required', 'date_format:Y-m-d'],

                    'quantity'      => 'required|integer',
                    'unit_price'    => 'required|numeric',
                    'price'         => "required|regex:/^\d+(\.\d{1,2})?$/",
                    'discount'      => $this->discountRules(),
                    'total'         => 'nullable|digits_between:1,10',
                    'result'        => 'numeric|between:0,100.0',

                    'category_id'   => 'required|exists:categories,id',
                    'department_id' => 'required|numeric',
                    'item_id'       => 'required|integer',
                    'city_id'       => ['nullable', 'integer', new ExistsTenant('cities')],
                    'users_id'      => ['required', 'string', new ExistsTenant('users')],
                    'employer_id'   => ['required', 'numeric'],
                    'address_id'    => ['required', 'integer', new IsAddrExist],

                    'pids'          => ['required', 'array', new isInteger],
                    'images'        => 'required|array',
                    'categories'    => ['nullable', 'array', new ExistsTenant],

                    'checkout'      => 'requierd|boolean',
                    'dinner_time'   => ['required', Rule::in([1, 2, 3])],
                ];*/
                break;
        }
    }

    public function messages()
    {
        return [
            'name.required' => 'Name is required.'
        ];
    }

    public function attributes()
    {
        return [
            'name' => 'Name',
            'old_password' => 'Current Password',
        ];
    }

}
