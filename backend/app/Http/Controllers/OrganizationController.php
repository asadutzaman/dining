<?php

namespace App\Http\Controllers;

use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Exceptions\ValidatorException;
use Dotenv\Exception\ValidationException;
use App\Http\Resources\OrganizationResource;
use App\Repositories\OrganizationRepository;
use App\Traits\Controller\RestControllerTrait;
use App\Validators\OrganizationValidator;
use App\Services\ResourceService;

class OrganizationController extends Controller
{
    private $repository;

    private $validator;

    private $resource;

    private $partialUpdateFields = ['status'];

    use RestControllerTrait;

    public function __construct(OrganizationRepository $repository, OrganizationValidator $validator)
    {
        $this->repository = $repository;
        $this->validator = $validator;
        $this->resource = OrganizationResource::class;
    }

    public function getOrganizationTree()
    {
        return $this->repository->getOrganizationTree();
    }

    // public function store(Request $request)
    // {
    //     try {
    //         $items = $request->all();

    //         $organizationDataResult = $this->repository->create($items);
    //         if (empty($organizationDataResult)) {
    //             throw new Exception("Organization save fail!");
    //         }

    //         DB::commit();
    //         $response = $this->repository->show($organizationDataResult["id"]);
    //         return $this->successResponse($response);
    //     } catch (ValidationException $e) {
    //         DB::rollBack();
    //         throw new ValidatorException($e);
    //     } catch (\Exception $e) {
    //         DB::rollBack();
    //         $this->errorResponse($e->getMessage());
    //     }
    //     //
    // }

    // public function update(Request $request, $id)
    // {
    //     DB::beginTransaction();
    //     try {
    //         $items = $request->all();

    //         $organizationId = isset($id) ? $id : null;
    //         if (empty($organizationId)) {
    //             throw new Exception("Organization update fail!");
    //         }

    //         $organizationDataResult = $this->repository->update($items, $organizationId);

    //         if (empty($organizationDataResult)) {
    //             throw new Exception("Organization update fail!");
    //         }

    //         DB::commit();
    //         $response = $this->repository->show($id);
    //         $response = ResourceService::getResources($response, OrganizationResource::class);
    //         return $this->successResponse($response);
    //     } catch (ValidationException $e) {
    //         DB::rollBack();
    //         throw new ValidatorException($e);
    //     } catch (\Exception $e) {
    //         DB::rollBack();
    //         $this->errorResponse($e->getMessage());
    //     }
    // }

    public function getOrganizationChildIds(Request $request)
    {
        $organizationId = $request->post('organization_id');
        return $this->repository->getChildIds($organizationId);
    }
}
