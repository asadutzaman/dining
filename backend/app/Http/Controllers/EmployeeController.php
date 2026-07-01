<?php

namespace App\Http\Controllers;

use App\Http\Resources\EmployeeResource;
use App\Repositories\EmployeeRepository;
use App\Traits\Controller\RestControllerTrait;
use App\Validators\EmployeeValidator;
use Illuminate\Http\Request;

class EmployeeController extends Controller
{
    private $repository;

    private $validator;

    private $resource;

    private $partialUpdateFields = ['user_id', 'status'];

    use RestControllerTrait;

    public function __construct(EmployeeRepository $repository, EmployeeValidator $validator)
    {
        $this->repository = $repository;
        $this->validator = $validator;
        $this->resource = EmployeeResource::class;
    }

    public function getByUserId($userId)
    {
        try {
            $result = $this->repository->getByUserId($userId);
            $response = isset($this->resource) ? new $this->resource($result) : $result;
            return $this->successResourceResponse($response);
        }
        catch (\Exception $e) {
            $this->errorResponse($e->getMessage());
        }
    }


    public function getEmployeeListByDesignationIds(Request $request)
    {

        //  echo "<pre>";
        // print_r($request->designationIds);
        // echo "</pre>";
        // exit();

     //   $implodeString = "[".$designationIds."]";


        return $this->repository->newQuery()
        ->whereIn('designation_id',  $request->designationIds )
        //->whereIn('designation_id', [7,8,9])
            //->where('designation_id', '=', $designationIds)
            ->get();

           // \App\Services\DebugService::getSqlWithBindings($query);
    }



}
