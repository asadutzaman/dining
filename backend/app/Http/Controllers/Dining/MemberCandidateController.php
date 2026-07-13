<?php

namespace App\Http\Controllers\Dining;

use App\Http\Controllers\Controller;
use App\Repositories\Dining\MemberCandidateRepository;
use App\Http\Resources\Dining\MemberCandidateResource;
use App\Services\Dining\NcmsRosterService;
use App\Traits\Controller\RestControllerTrait;
use Illuminate\Http\Request;

class MemberCandidateController extends Controller
{
    private $repository;

    private $resource;

    private $ncmsRosterService;

    use RestControllerTrait;

    public function __construct(MemberCandidateRepository $repository, NcmsRosterService $ncmsRosterService)
    {
        $this->repository = $repository;
        $this->ncmsRosterService = $ncmsRosterService;
        $this->resource = MemberCandidateResource::class;
    }

    // Pull the whole staff/student roster from NCMS. Safe to re-run: it upserts.
    public function sync()
    {
        try {
            $result = $this->repository->syncFromNcms($this->ncmsRosterService);

            return $this->successResponse([
                'created'     => $result['created'],
                'updated'     => $result['updated'],
                'deactivated' => $result['deactivated'],
                'skipped'     => $result['skipped'],
                'total'       => $result['total'],
            ]);
        } catch (\Exception $e) {
            $this->errorResponse('NCMS sync failed: ' . $e->getMessage());
        }
    }

    /**
     * Look a punched card up against the roster. Called by the token screen only after the card
     * failed to match a member, to tell "on the roster but not a dining member yet" (enrollable)
     * apart from "this card is unknown to NCMS too".
     */
    public function findByCard(Request $request)
    {
        try {
            $cardNumber = $request->query('rfid_card_number');
            if (empty($cardNumber)) {
                $this->errorResponse('RFID card number is required!');
            }

            $candidate = $this->repository->findActiveByRfid($cardNumber);
            if (!$candidate) {
                $this->notFoundResponse();
            }

            return $this->successResourceResponse(new MemberCandidateResource($candidate));
        } catch (\Exception $e) {
            $this->errorResponse($e->getMessage());
        }
    }
}
