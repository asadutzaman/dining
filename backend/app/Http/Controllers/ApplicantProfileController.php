<?php

namespace App\Http\Controllers;

use App\Exceptions\ValidatorException;
use Illuminate\Http\Request;
use App\Validators\ApplicantProfileValidator;
use App\Repositories\ApplicantProfileRepository;
use App\Http\Resources\ApplicantProfileResource;
use App\Services\ResourceService;
use App\Traits\Controller\RestControllerTrait;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ApplicantProfileController extends Controller
{
    private $repository;
    private $educationalQualificationRepository;

    private $validator;

    private $resource;

    private $partialUpdateFields = ['status'];

    use RestControllerTrait;

    public function __construct(ApplicantProfileRepository $repository, ApplicantProfileValidator $validator)
    {
        $this->repository = $repository;


        $this->validator = $validator;
        $this->resource = ApplicantProfileResource::class;
    }

    public function profileDetails($id)
    {
        try {
            $result = $this->repository->getDetailsByUserId($id);
            $response = isset($this->resource) ? new $this->resource($result) : $result;
            return $this->successResourceResponse($response);
        } catch (\Exception $e) {
            $this->errorResponse($e->getMessage());
        }
    }
}
