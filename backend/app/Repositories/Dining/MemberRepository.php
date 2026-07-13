<?php

namespace App\Repositories\Dining;

use App\Models\Dining\Member;
use App\Models\Dining\MemberCandidate;
use App\Repositories\BaseRepository;
use App\Repositories\CodeSequenceRepository;
use App\Services\ODataService;
use App\Services\Dining\NcmsPhotoService;

class MemberRepository extends BaseRepository
{
    /**
    * @var Member
    */
    protected $model;

    protected $request;

    protected $oDataService;

    protected $fieldSearchable = ['member_code', 'rfid_card_number', 'name', 'phone', 'email', 'roll_no'];

    public function __construct()
    {
        $this->model = new Member();
    }

    protected function init()
    {
        $this->request      = request();
        $this->oDataService = (new ODataService())->init();
    }

    public function checkMemberCodeUnique($memberCode, $id = null)
    {
        return $this->newQuery()
            ->where('member_code', $memberCode)
            ->when((isset($id)), function ($query) use ($id) {
                return $query->whereNot('id', $id);
            })
            ->count();
    }

    public function findByRfidCardNumber($rfidCardNumber)
    {
        return $this->newQuery()
            ->where('rfid_card_number', $rfidCardNumber)
            ->where('status', 1)
            ->first();
    }

    /**
     * Same lookup but ignoring status, for uniqueness checks: rfid_card_number is unique at the
     * DB level, so a card held by a *deactivated* member still blocks reuse. Checking only
     * active members would turn that into a raw integrity-constraint error.
     */
    public function findAnyByRfidCardNumber($rfidCardNumber)
    {
        return $this->newQuery()
            ->where('rfid_card_number', $rfidCardNumber)
            ->first();
    }

    public function findByCandidateId($candidateId)
    {
        return $this->newQuery()
            ->where('candidate_id', $candidateId)
            ->first();
    }

    /**
     * Create a dining member from a roster candidate.
     *
     * The single place membership is granted -- the member form, the counter's enroll-on-punch,
     * and bulk enrollment all come through here, so the guards below cannot be bypassed by one
     * caller forgetting them.
     *
     * Idempotent by candidate: a double-punch at the counter is a real race, so an already
     * enrolled candidate returns the existing member rather than erroring.
     *
     * Caller is responsible for the surrounding transaction.
     *
     * @param array $overrides any member column; rfid_card_number falls back to the candidate's card
     * @throws \Exception if the card is already held by someone else
     */
    public function enrollFromCandidate(MemberCandidate $candidate, array $overrides = []): Member
    {
        $existingMember = $this->findByCandidateId($candidate->id);
        if ($existingMember) {
            return $existingMember;
        }

        $rfid = $overrides['rfid_card_number'] ?? $candidate->rfid;
        $rfid = $rfid === '' ? null : $rfid;

        if (!empty($rfid)) {
            $cardHolder = $this->findAnyByRfidCardNumber($rfid);
            if ($cardHolder) {
                throw new \Exception("RFID card {$rfid} is already assigned to {$cardHolder->name}!");
            }
        }

        $codeSequenceRepository = new CodeSequenceRepository();
        $memberCode = $codeSequenceRepository->getLatestCodeByLabel('MEMBER');
        if ($memberCode == null) {
            throw new \Exception('Number Sequence not found!');
        }
        if ($this->checkMemberCodeUnique($memberCode) > 0) {
            throw new \Exception("{$memberCode} - This Number Sequence already exists!");
        }

        $photoId = $overrides['photo_id'] ?? app(NcmsPhotoService::class)->importFromUrl($candidate->image_url);

        $data = array_merge([
            'member_type' => $candidate->memberType(),
            'name'        => $candidate->name,
            'staff_id'    => $candidate->staff_id,
            'roll_no'     => $candidate->roll_no,
        ], $overrides);

        $data['member_code']      = $memberCode;
        $data['candidate_id']     = $candidate->id;
        $data['rfid_card_number'] = $rfid;
        $data['photo_id']         = $photoId;

        $member = $this->create($data);

        if (empty($member)) {
            throw new \Exception('Member insertion failed!');
        }

        // A card bound here (someone NCMS has no rfid for) is written back to the roster row too,
        // so the candidate list shows them as carded. The sync never overwrites a non-empty
        // candidate rfid, so this survives future syncs.
        if (!empty($rfid) && empty($candidate->rfid)) {
            $candidate->rfid = $rfid;
            $candidate->save();
        }

        $codeSequenceRepository->updateNextSequenceByLabel('MEMBER');

        return $member;
    }

    public function incrementDueBalance($memberId, $amount)
    {
        return $this->newQuery()
            ->where('id', $memberId)
            ->increment('due_balance', $amount);
    }

    public function decrementDueBalance($memberId, $amount)
    {
        return $this->newQuery()
            ->where('id', $memberId)
            ->decrement('due_balance', $amount);
    }
}
