<?php

namespace App\Http\Controllers\Dining;

use App\Http\Controllers\Controller;
use App\Validators\Dining\MealTokenValidator;
use App\Repositories\Dining\MealTokenRepository;
use App\Repositories\Dining\MemberRepository;
use App\Repositories\Dining\MealSettingRepository;
use App\Repositories\CodeSequenceRepository;
use App\Http\Resources\Dining\MealTokenResource;
use App\Services\SessionService;
use App\Traits\Controller\RestControllerTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Dotenv\Exception\ValidationException;
use App\Exceptions\ValidatorException;
use Carbon\Carbon;

class MealTokenController extends Controller
{
    private $repository;

    private $validator;

    private $resource;

    private $partialUpdateFields = ['status'];

    use RestControllerTrait;

    public function __construct(MealTokenRepository $repository, MealTokenValidator $validator)
    {
        $this->repository = $repository;
        $this->validator = $validator;
        $this->resource = MealTokenResource::class;
    }

    public function store(Request $request)
    {
        /*
         * STEP-1: VALIDATE MEMBER + PREVENT DUPLICATE TOKEN FOR SAME MEAL/DAY
         * STEP-2: RESOLVE MEAL COST FROM MEAL SETTINGS
         * STEP-3: GENERATE TOKEN NUMBER
         * STEP-4: CREATE TOKEN
         * STEP-5: IF DUE, ADD TO MEMBER RUNNING DUE BALANCE
         */
        DB::beginTransaction();
        try {
            if (isset($this->validator)) {
                $this->validate($request, $this->validator->rules(), $this->validator->messages());
            }

            $mealDate = $request->meal_date ?? now()->format('Y-m-d');

            $member = (new MemberRepository())->findById($request->member_id);
            if (!$member || $member->status != 1) {
                $this->errorResponse('Member not found or inactive!');
            }

            $alreadyIssued = $this->repository->checkAlreadyIssued($request->member_id, $request->meal_type, $mealDate);
            if ($alreadyIssued > 0) {
                $this->errorResponse('A token has already been issued to this member for this meal today!');
            }

            $mealSetting = (new MealSettingRepository())->getEffectiveCost($request->meal_type, $mealDate);
            if (!$mealSetting) {
                $this->errorResponse('No active cost setting found for this meal type!');
            }

            $latestCodeSequence = (new CodeSequenceRepository())->getLatestCodeByLabel('MEAL_TOKEN');
            if ($latestCodeSequence == null) {
                $this->errorResponse('Number Sequence not found!');
            }

            $sessionService = (new SessionService())->init();
            $userData = $sessionService->getUserData();

            $tokenResult = $this->repository->create([
                'token_number'      => $latestCodeSequence,
                'member_id'         => $request->member_id,
                'meal_type'         => $request->meal_type,
                'meal_date'         => $mealDate,
                'amount'            => $mealSetting->cost,
                'payment_status'    => $request->payment_status,
                'payment_method'    => $request->payment_status == 'PAID' ? ($request->payment_method ?? 'CASH') : null,
                'collection_status' => 'ISSUED',
                'issued_by'         => $userData['id'] ?? null,
            ]);

            if (empty($tokenResult)) {
                $this->errorResponse('Token issuance failed!');
            }

            (new CodeSequenceRepository())->updateNextSequenceByLabel('MEAL_TOKEN');

            if ($request->payment_status == 'DUE') {
                (new MemberRepository())->incrementDueBalance($request->member_id, $mealSetting->cost);
            }

            DB::commit();
            $response = isset($this->resource) ? new $this->resource($tokenResult) : $tokenResult;
            return $this->successResourceResponse($response);
        } catch (ValidationException $e) {
            DB::rollBack();
            throw new ValidatorException($e);
        } catch (\Exception $e) {
            DB::rollBack();
            $this->errorResponse($e->getMessage());
        }
    }

    // Manager-facing: mark a token as collected once food is handed over
    public function collect(Request $request, $id)
    {
        DB::beginTransaction();
        try {
            $token = $this->repository->findById($id);
            if (!$token) {
                $this->notFoundResponse();
            }

            if ($token->collection_status == 'COLLECTED') {
                $this->errorResponse('This token has already been collected!');
            }

            $sessionService = (new SessionService())->init();
            $userData = $sessionService->getUserData();

            $this->repository->update([
                'collection_status' => 'COLLECTED',
                'collected_at'      => Carbon::now(),
                'collected_by'      => $userData['id'] ?? null,
            ], $id);

            DB::commit();
            $result = $this->repository->show($id);
            $response = isset($this->resource) ? new $this->resource($result) : $result;
            return $this->successResourceResponse($response);
        } catch (\Exception $e) {
            DB::rollBack();
            $this->errorResponse($e->getMessage());
        }
    }

    // Manager-facing: look up a token by its printed token number to verify/collect
    public function findByTokenNumber(Request $request)
    {
        try {
            $tokenNumber = $request->query('token_number');
            if (empty($tokenNumber)) {
                $this->errorResponse('Token number is required!');
            }

            $token = $this->repository->findByTokenNumber($tokenNumber);
            if (!$token) {
                $this->notFoundResponse();
            }

            $response = new MealTokenResource($token);
            return $this->successResourceResponse($response);
        } catch (\Exception $e) {
            $this->errorResponse($e->getMessage());
        }
    }

    public function destroy($id)
    {
        DB::beginTransaction();
        try {
            $token = $this->repository->findById($id);
            if (!$token) {
                $this->notFoundResponse();
            }

            // Reverse the running due balance if this token was unpaid
            if ($token->payment_status == 'DUE') {
                (new MemberRepository())->decrementDueBalance($token->member_id, $token->amount);
            }

            $response = $this->repository->delete($id);
            if (!$response) {
                $this->errorResponse();
            }

            DB::commit();
            return $this->deleteResponse();
        } catch (\Exception $e) {
            DB::rollBack();
            $this->errorResponse($e->getMessage());
        }
    }
}
