<?php

namespace App\Http\Controllers\Dining;

use App\Http\Controllers\Controller;
use App\Validators\Dining\MemberValidator;
use App\Repositories\Dining\MemberRepository;
use App\Repositories\CodeSequenceRepository;
use App\Http\Resources\Dining\MemberResource;
use App\Imports\MemberImport;
use App\Traits\Controller\RestControllerTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Dotenv\Exception\ValidationException;
use App\Exceptions\ValidatorException;
use Maatwebsite\Excel\Facades\Excel;

class MemberController extends Controller
{
    private $repository;

    private $validator;

    private $resource;

    private $partialUpdateFields = ['status'];

    use RestControllerTrait;

    public function __construct(MemberRepository $repository, MemberValidator $validator)
    {
        $this->repository = $repository;
        $this->validator = $validator;
        $this->resource = MemberResource::class;
    }

    public function store(Request $request)
    {
        DB::beginTransaction();
        try {
            if (isset($this->validator)) {
                $this->validate($request, $this->validator->rules(), $this->validator->messages());
            }

            if (!empty($request->rfid_card_number)) {
                $existing = $this->repository->findByRfidCardNumber($request->rfid_card_number);
                if ($existing) {
                    $this->errorResponse('This RFID card number is already assigned to another member!');
                }
            }

            if (!empty($request->candidate_id)) {
                $existingByCandidate = $this->repository->findWhere('candidate_id', $request->candidate_id);
                if ($existingByCandidate->isNotEmpty()) {
                    $this->errorResponse('This candidate has already been added as a member!');
                }
            }

            $latestCodeSequence = (new CodeSequenceRepository())->getLatestCodeByLabel('MEMBER');
            if ($latestCodeSequence == null) {
                $this->errorResponse('Number Sequence not found!');
            }
            $checkDuplicateMemberCode = $this->repository->checkMemberCodeUnique($latestCodeSequence);
            if ($checkDuplicateMemberCode > 0) {
                $this->errorResponse("{$latestCodeSequence} - This Number Sequence already exists!");
            }

            $memberResult = $this->repository->create([
                'member_code'      => $latestCodeSequence,
                'rfid_card_number' => $request->rfid_card_number,
                'member_type'      => $request->member_type,
                'name'             => $request->name,
                'phone'            => $request->phone,
                'email'            => $request->email,
                'photo_id'         => $request->photo_id,
                'department_id'    => $request->department_id,
                'designation_id'   => $request->designation_id,
                'staff_id'         => $request->staff_id,
                'candidate_id'     => $request->candidate_id,
                'class_name'       => $request->class_name,
                'section'          => $request->section,
                'roll_no'          => $request->roll_no,
            ]);

            if (empty($memberResult)) {
                $this->errorResponse('Member insertion failed!');
            }

            (new CodeSequenceRepository())->updateNextSequenceByLabel('MEMBER');

            DB::commit();
            $response = isset($this->resource) ? new $this->resource($memberResult) : $memberResult;
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
        DB::beginTransaction();
        try {
            if (isset($this->validator)) {
                $this->validate($request, $this->validator->rules(), $this->validator->messages());
            }

            if (!empty($request->rfid_card_number)) {
                $existing = $this->repository->findByRfidCardNumber($request->rfid_card_number);
                if ($existing && $existing->id != $id) {
                    $this->errorResponse('This RFID card number is already assigned to another member!');
                }
            }

            $this->repository->update([
                'rfid_card_number' => $request->rfid_card_number,
                'member_type'      => $request->member_type,
                'name'             => $request->name,
                'phone'            => $request->phone,
                'email'            => $request->email,
                'photo_id'         => $request->photo_id,
                'department_id'    => $request->department_id,
                'designation_id'   => $request->designation_id,
                'staff_id'         => $request->staff_id,
                'class_name'       => $request->class_name,
                'section'          => $request->section,
                'roll_no'          => $request->roll_no,
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

    // Used by the RFID scan screen to look a member up by card number
    public function findByCard(Request $request)
    {
        try {
            $cardNumber = $request->query('rfid_card_number');
            if (empty($cardNumber)) {
                $this->errorResponse('RFID card number is required!');
            }

            $member = $this->repository->findByRfidCardNumber($cardNumber);
            if (!$member) {
                $this->notFoundResponse();
            }

            $response = new MemberResource($member);
            return $this->successResourceResponse($response);
        } catch (\Exception $e) {
            $this->errorResponse($e->getMessage());
        }
    }

    // Bulk upload staff/student records from a CSV/XLSX file.
    // Expected header row: member_type,name,phone,email,rfid_card_number,department,designation,class_name,section,roll_no
    public function bulkImport(Request $request)
    {
        try {
            $this->validate($request, [
                'file' => ['required', 'file', 'mimes:csv,xlsx,xls', 'max:5120'],
            ]);

            $import = new MemberImport();
            Excel::import($import, $request->file('file'));

            return $this->successResponse([
                'imported_count' => $import->importedCount,
                'skipped_rows'   => $import->skippedRows,
            ]);
        } catch (ValidationException $e) {
            throw new ValidatorException($e);
        } catch (\Exception $e) {
            $this->errorResponse($e->getMessage());
        }
    }
}
