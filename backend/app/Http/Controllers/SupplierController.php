<?php

namespace App\Http\Controllers;

use App\Http\Resources\SupplierResource;
use App\Repositories\CodeSequenceRepository;
use App\Repositories\SupplierRepository;
use App\Traits\Controller\RestControllerTrait;
use App\Validators\SupplierValidator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Dotenv\Exception\ValidationException;
use App\Exceptions\ValidatorException;
use App\Repositories\GoodsReceiveNoteRepository;

class SupplierController extends Controller
{
    private $repository;

    private $validator;

    private $resource;

    private $partialUpdateFields = ['status'];

    use RestControllerTrait;

    public function __construct(SupplierRepository $repository, SupplierValidator $validator)
    {
        $this->repository = $repository;
        $this->validator = $validator;
        $this->resource = SupplierResource::class;
    }

    public function store(Request $request)
    {
        /*
         * STEP-1: GET SUPPLIER LATEST CODE
         * STEP-2: STORE SUPPLIER DATA
         * STEP-3: UPDATE CODE SEQUENCE
        */

        DB::beginTransaction();
        try {
            if (!isset($this->repository)) {
                $this->errorResponse('Repository not defined');
            }

            if (isset($this->validator)) {
                $this->validate($request, $this->validator->rules(), $this->validator->messages());
            }

            // STEP-1: GET SUPPLIER LATEST CODE
            $latestCodeSequence = (new CodeSequenceRepository())->getLatestCodeByLabel('SUPPLIER');
            if ($latestCodeSequence == null) {
                $this->errorResponse("Number Sequence not found!");
            }
            // CHECK DUPLICATE SUPPLIER NUMBER
            $checkDuplicateSupplierNo = $this->repository->checkSupplierNoUnique($latestCodeSequence);
            if ($checkDuplicateSupplierNo > 0) {
                $this->errorResponse("{$latestCodeSequence} - This Number Sequence is already exist!");
            }

            // STEP-2: STORE REQUISITION DATA
            $supplierResult =  $this->repository->create([
                'supplier_no'   => $latestCodeSequence,
                'supplier_name' => $request->supplier_name,
                'phone'         => $request->phone,
                'email'         => $request->email,
                'address'       => $request->address,
            ]);

            if (empty($supplierResult)) {
                $this->errorResponse("Supplier Insertion fail!");
            }

            // STEP-3: UPDATE CODE SEQUENCE
            (new CodeSequenceRepository())->updateNextSequenceByLabel('SUPPLIER');

            DB::commit();
            $response = isset($this->resource) ? new $this->resource($supplierResult) : $supplierResult;
            return $this->successResourceResponse($response);
        } catch (ValidationException $e) {
            DB::rollBack();
            throw new ValidatorException($e);
        } catch (\Exception $e) {
            DB::rollBack();
            $this->errorResponse($e->getMessage());
        }
    }

    public function update(Request $request, $id)
    {
        /*
         * STEP-1: UPDATE SUPPLIER DATA
        */

        DB::beginTransaction();
        try {
            if (!isset($this->repository)) {
                $this->errorResponse('Repository not defined');
            }

            if (isset($this->validator)) {
                $this->validate($request, $this->validator->rules(), $this->validator->messages());
            }

            // STEP-1: UPDATE SUPPLIER DATA
            $this->repository->update([
                'supplier_name' => $request->supplier_name,
                'phone'         => $request->phone,
                'email'         => $request->email,
                'address'       => $request->address,
            ], $id);

            DB::commit();
            $result = $this->repository->show($id);
            $response = isset($this->resource) ? new $this->resource($result) : $result;
            return $this->successResourceResponse($response);
        } catch (ValidationException $e) {
            DB::rollBack();
            throw new ValidatorException($e);
        } catch (\Exception $e) {
            DB::rollBack();
            $this->errorResponse($e->getMessage());
        }
    }

    public function destroy($id)
    {
        try {
            if (!isset($this->repository)) {
                $this->errorResponse('Repository not defined');
            }

            $entity = $this->repository->findById($id);
            if (!$entity) {
                $this->notFoundResponse();
            }

            if ((new GoodsReceiveNoteRepository())->exists(['supplier_id' => $id])) {
                $this->errorResponse('This Supplier is used in Goods Receive Note');
            }

            $response = $this->repository->delete($id);
            if (!$response) {
                $this->errorResponse();
            }
            return $this->deleteResponse();
        } catch (\Exception $e) {
            $this->errorResponse($e->getMessage());
        }
    }
}
