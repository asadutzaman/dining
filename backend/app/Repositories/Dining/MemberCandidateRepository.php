<?php

namespace App\Repositories\Dining;

use App\Models\Dining\MemberCandidate;
use App\Repositories\BaseRepository;
use App\Services\ODataService;
use App\Services\Dining\NcmsRosterService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Carbon;

class MemberCandidateRepository extends BaseRepository
{
    /**
    * @var MemberCandidate
    */
    protected $model;

    protected $request;

    protected $oDataService;

    protected $fieldSearchable = ['name', 'staff_id', 'roll_no', 'external_id', 'rfid'];

    public function __construct()
    {
        $this->model = new MemberCandidate();
    }

    protected function init()
    {
        $this->request      = request();
        $this->oDataService = (new ODataService())->init();
    }

    public function listQuery(): Builder
    {
        $query = parent::listQuery();

        // The picker only offers people who can still be enrolled: already-enrolled members
        // are hidden, and so is anyone NCMS has dropped from the roster.
        return $query->whereDoesntHave('importedMember')
            ->where('is_active', 1);
    }

    public function findActiveByRfid($rfid)
    {
        if (empty($rfid)) {
            return null;
        }

        return $this->newQuery()
            ->where('rfid', $rfid)
            ->where('is_active', 1)
            ->first();
    }

    /**
     * Pull the whole NCMS roster into member_candidates.
     *
     * Idempotent: keyed on (type, external_id), so re-running only updates. Never deletes --
     * a candidate may already be referenced by members.candidate_id -- so people who vanish
     * from the API are marked is_active = 0 instead.
     *
     * @param bool $dryRun report what would change without writing
     * @return array{created:int,updated:int,deactivated:int,skipped:int,total:int,sample:?array}
     */
    public function syncFromNcms(NcmsRosterService $ncms, bool $dryRun = false): array
    {
        $rows = $ncms->fetchUsers();

        $created = 0;
        $updated = 0;
        $skipped = 0;
        $sample  = null;
        $seen    = [];
        $now     = Carbon::now();

        foreach ($rows as $row) {
            $data = $ncms->normalize($row);

            if ($data === null) {
                $skipped++;
                continue;
            }

            $sample = $sample ?? $data;
            $seen[$data['type'] . '|' . $data['external_id']] = true;

            $existing = $this->newQuery()
                ->where('type', $data['type'])
                ->where('external_id', $data['external_id'])
                ->first();

            if ($dryRun) {
                $existing ? $updated++ : $created++;
                continue;
            }

            if ($existing) {
                $existing->fill($this->mergeableFields($existing, $data));
                $existing->synced_at = $now;
                $existing->is_active = 1;
                $existing->save();
                $updated++;
            }
            else {
                $data['synced_at'] = $now;
                $data['is_active'] = 1;
                $this->create($data);
                $created++;
            }
        }

        $deactivated = 0;
        if (!$dryRun && !empty($seen)) {
            $deactivated = $this->deactivateMissing($seen);
        }

        return [
            'created'     => $created,
            'updated'     => $updated,
            'deactivated' => $deactivated,
            'skipped'     => $skipped,
            'total'       => count($rows),
            'sample'      => $sample,
        ];
    }

    /**
     * NCMS is authoritative for names and photos, but NOT for cards: a card assigned inside
     * the dining app must survive a re-sync, so an existing rfid is never cleared or replaced
     * by what NCMS reports. A blank local rfid is still filled in from NCMS.
     */
    private function mergeableFields(MemberCandidate $existing, array $data): array
    {
        if (!empty($existing->rfid)) {
            unset($data['rfid']);
        }
        elseif (empty($data['rfid'])) {
            unset($data['rfid']);
        }

        return $data;
    }

    /**
     * @param array $seenKeys "type|external_id" => true, for O(1) lookup
     */
    private function deactivateMissing(array $seenKeys): int
    {
        $count = 0;

        // Chunked so a ~1000-key NOT IN doesn't turn into one enormous statement.
        $this->newQuery()
            ->where('is_active', 1)
            ->select(['id', 'type', 'external_id'])
            ->chunkById(500, function ($candidates) use ($seenKeys, &$count) {
                $missing = $candidates
                    ->filter(function ($candidate) use ($seenKeys) {
                        return !isset($seenKeys[$candidate->type . '|' . $candidate->external_id]);
                    })
                    ->pluck('id')
                    ->all();

                if (!empty($missing)) {
                    $count += $this->newQuery()->whereIn('id', $missing)->update(['is_active' => 0]);
                }
            });

        return $count;
    }
}
