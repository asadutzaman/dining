<?php

namespace App\Http\Controllers\Dining;

use App\Http\Controllers\Controller;
use App\Validators\Dining\MemberValidator;
use App\Repositories\Dining\MemberRepository;
use App\Repositories\Dining\MemberCandidateRepository;
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

    private $candidateRepository;

    private $validator;

    private $resource;

    private $partialUpdateFields = ['status'];

    use RestControllerTrait;

    public function __construct(
        MemberRepository $repository,
        MemberCandidateRepository $candidateRepository,
        MemberValidator $validator
    ) {
        $this->repository = $repository;
        $this->candidateRepository = $candidateRepository;
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

            // Enrolling someone off the NCMS roster: hand off to the shared primitive so this
            // path, the counter's enroll-on-punch and bulk enrollment stay in step.
            if (!empty($request->candidate_id)) {
                $candidate = $this->candidateRepository->findById($request->candidate_id);
                if (!$candidate) {
                    $this->errorResponse('Candidate not found!');
                }

                if ($this->repository->findByCandidateId($candidate->id)) {
                    $this->errorResponse('This candidate has already been added as a member!');
                }

                $memberResult = $this->repository->enrollFromCandidate($candidate, array_filter([
                    'rfid_card_number' => $request->rfid_card_number,
                    'phone'            => $request->phone,
                    'email'            => $request->email,
                    'photo_id'         => $request->photo_id,
                    'department_id'    => $request->department_id,
                    'designation_id'   => $request->designation_id,
                    'class_name'       => $request->class_name,
                    'section'          => $request->section,
                ], function ($value) {
                    return $value !== null && $value !== '';
                }));

                DB::commit();
                $response = isset($this->resource) ? new $this->resource($memberResult) : $memberResult;
                return $this->successResourceResponse($response);
            }

            if (!empty($request->rfid_card_number)) {
                $existing = $this->repository->findAnyByRfidCardNumber($request->rfid_card_number);
                if ($existing) {
                    $this->errorResponse('This RFID card number is already assigned to another member!');
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
                'rfid_card_number' => $request->rfid_card_number ?: null,
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

    /**
     * The counter path: an NCMS card was punched that belongs to nobody in `members` yet.
     * Enroll the person the card belongs to, so the token screen can carry straight on to
     * issuing their meal. This is how the ~170-200 real dining members get registered --
     * by showing up to eat.
     */
    public function enrollByCard(Request $request)
    {
        DB::beginTransaction();
        try {
            $this->validate($request, [
                'rfid_card_number' => ['required', 'string', 'max:64'],
            ]);

            $existingMember = $this->repository->findByRfidCardNumber($request->rfid_card_number);
            if ($existingMember) {
                // Double punch: already a member, nothing to enroll.
                DB::commit();
                return $this->successResourceResponse(new MemberResource($existingMember));
            }

            $candidate = $this->candidateRepository->findActiveByRfid($request->rfid_card_number);
            if (!$candidate) {
                $this->notFoundResponse();
            }

            $member = $this->repository->enrollFromCandidate($candidate);

            DB::commit();
            return $this->successResourceResponse(new MemberResource($member));
        } catch (ValidationException $e) {
            DB::rollBack();
            throw new ValidatorException($e);
        } catch (\Exception $e) {
            DB::rollBack();
            $this->errorResponse($e->getMessage());
        }
    }

    /**
     * The no-card-in-NCMS path: an unrecognized card was punched, an operator searched the
     * roster and said who it belongs to. Enroll them and bind the physical card in one step.
     */
    public function enrollAndBindCard(Request $request)
    {
        DB::beginTransaction();
        try {
            $this->validate($request, [
                'candidate_id'     => ['required', 'integer'],
                'rfid_card_number' => ['required', 'string', 'max:64'],
            ]);

            $candidate = $this->candidateRepository->findById($request->candidate_id);
            if (!$candidate) {
                $this->notFoundResponse();
            }

            $member = $this->repository->enrollFromCandidate($candidate, [
                'rfid_card_number' => $request->rfid_card_number,
            ]);

            DB::commit();
            return $this->successResourceResponse(new MemberResource($member));
        } catch (ValidationException $e) {
            DB::rollBack();
            throw new ValidatorException($e);
        } catch (\Exception $e) {
            DB::rollBack();
            $this->errorResponse($e->getMessage());
        }
    }

    /**
     * Enroll a batch of candidates picked in the "Add From API" modal. Each row is reported
     * back individually: one duplicate card must not silently drop the other 40 people.
     */
    public function enrollBulk(Request $request)
    {
        try {
            $this->validate($request, [
                'candidate_ids'   => ['required', 'array', 'min:1'],
                'candidate_ids.*' => ['integer'],
            ]);

            $enrolled = [];
            $failed   = [];

            foreach ($request->candidate_ids as $candidateId) {
                DB::beginTransaction();
                try {
                    $candidate = $this->candidateRepository->findById($candidateId);
                    if (!$candidate) {
                        throw new \Exception('Candidate not found.');
                    }

                    $member = $this->repository->enrollFromCandidate($candidate);
                    DB::commit();

                    $enrolled[] = new MemberResource($member);
                } catch (\Exception $e) {
                    DB::rollBack();
                    $failed[] = [
                        'candidate_id' => $candidateId,
                        'name'         => isset($candidate) && $candidate ? $candidate->name : null,
                        'reason'       => $e->getMessage(),
                    ];
                }
            }

            return $this->successResponse([
                'enrolled_count' => count($enrolled),
                'failed_count'   => count($failed),
                'enrolled'       => $enrolled,
                'failed'         => $failed,
            ]);
        } catch (ValidationException $e) {
            throw new ValidatorException($e);
        } catch (\Exception $e) {
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
                $existing = $this->repository->findAnyByRfidCardNumber($request->rfid_card_number);
                if ($existing && $existing->id != $id) {
                    $this->errorResponse('This RFID card number is already assigned to another member!');
                }
            }

            $this->repository->update([
                // NULL, not '': rfid_card_number is unique, and a second card-less member
                // would collide on the empty string.
                'rfid_card_number' => $request->rfid_card_number ?: null,
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
