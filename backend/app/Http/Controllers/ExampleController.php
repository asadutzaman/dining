<?php

namespace App\Http\Controllers;

use App\Exceptions\ValidatorException;
use App\Http\Resources\ExampleResource;
use App\Models\Example;
use App\Repositories\ExampleRepository;
use App\Services\SessionService;
use App\Traits\Controller\RestControllerTrait;
use App\Validators\ExampleValidator;
use Dotenv\Exception\ValidationException;
use Illuminate\Http\Request;

class ExampleController extends Controller
{
    private $repository;

    private $validator;

    private $resource;

    private $partialUpdateFields = ['status'];

    use RestControllerTrait;

    public function __construct(ExampleRepository $repository, ExampleValidator $validator)
    {
        $this->repository = $repository;
        $this->validator = $validator;
        $this->resource = ExampleResource::class;
    }

    public function store(Request $request)
    {
        try {
            if (!isset($this->repository)) {
                $this->errorResponse('Repository not defined');
            }

            if (isset($this->validator)) {
                $this->validate($request, $this->validator->rules(), $this->validator->messages());
            }
            $result = $this->repository->create($request->all());
            $response = isset($this->resource) ? new $this->resource($result) : $result;
            return $this->successResourceResponse($response);
        } catch (ValidationException $e) {
            throw new ValidatorException($e);
        } catch (\Exception $e) {
            $this->errorResponse($e->getMessage());
        }
    }

    public function test()
    {
        $sessionService = (new SessionService())->init();
        $userToken = $sessionService->getUserId();
        return $userToken;
    }
}
