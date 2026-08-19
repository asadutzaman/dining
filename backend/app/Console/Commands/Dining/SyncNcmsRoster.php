<?php

namespace App\Console\Commands\Dining;

use Illuminate\Console\Command;
use App\Repositories\Dining\MemberCandidateRepository;
use App\Services\Dining\NcmsRosterService;

class SyncNcmsRoster extends Command
{
    protected $signature = 'dining:sync-roster {--dry-run : Fetch and report without writing}';

    protected $description = 'Sync the staff/student roster from NCMS into member_candidates';

    public function handle(MemberCandidateRepository $repository, NcmsRosterService $ncms)
    {
        $dryRun = (bool) $this->option('dry-run');

        $this->info($dryRun ? 'Fetching NCMS roster (dry run, nothing will be written)...' : 'Syncing NCMS roster...');

        try {
            $result = $repository->syncFromNcms($ncms, $dryRun);
        } catch (\Exception $e) {
            $this->error('Sync failed: ' . $e->getMessage());
            return 1;
        }

        $this->table(
            ['fetched', 'created', 'updated', 'deactivated', 'skipped'],
            [[$result['total'], $result['created'], $result['updated'], $result['deactivated'], $result['skipped']]]
        );

        // The student record shape is unverified, so show what a normalized row actually
        // looks like -- an all-null roll_no here means normalize() is reading the wrong field.
        if ($result['sample']) {
            $this->line('Sample normalized row:');
            $this->line(json_encode($result['sample'], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
        }

        if ($result['skipped'] > 0) {
            $this->warn("{$result['skipped']} row(s) skipped: unknown type, or no name / external id.");
        }

        return 0;
    }
}
