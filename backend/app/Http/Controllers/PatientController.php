<?php

namespace App\Http\Controllers;

use App\Exceptions\ValidatorException;
use App\Http\Resources\PatientResource;
use App\Repositories\CodeSequenceRepository;
use App\Repositories\PatientRepository;
use App\Traits\Controller\RestControllerTrait;
use App\Validators\PatientValidator;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PatientController extends Controller
{
    private $repository;

    private $validator;

    private $resource;

    private $partialUpdateFields = ['status'];

    use RestControllerTrait;

    public function __construct(PatientRepository $repository, PatientValidator $validator)
    {
        $this->repository = $repository;
        $this->validator  = $validator;
        $this->resource   = PatientResource::class;
    }

    public function store(Request $request)
    {
        DB::beginTransaction();
        try {
            if (isset($this->validator)) {
                $this->validate($request, $this->validator->rules(), $this->validator->messages());
            }

            // Auto-generate MRN from code sequence
            $mrn = (new CodeSequenceRepository())->getLatestCodeByLabel('PATIENT');
            if ($mrn === null) {
                $this->errorResponse('MRN sequence not configured. Please seed the PATIENT code sequence.');
            }

            $data = array_merge($request->all(), ['mrn' => $mrn]);

            $result = $this->repository->create($data);

            if (empty($result)) {
                $this->errorResponse('Failed to register patient.');
            }

            // Advance the sequence only after successful save
            (new CodeSequenceRepository())->updateNextSequenceByLabel('PATIENT');

            DB::commit();
            $response = new $this->resource($result, false);
            return $this->successResourceResponse($response);
        } catch (ValidationException $e) {
            DB::rollBack();
            throw new ValidatorException($e);
        } catch (Exception $e) {
            DB::rollBack();
            $this->errorResponse($e->getMessage());
        }
    }
}
