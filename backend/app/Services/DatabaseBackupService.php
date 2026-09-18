<?php

namespace App\Services;

use RuntimeException;
use Symfony\Component\Process\Process;

/**
 * Dumps the whole app database to a .sql file via the server's mysqldump.
 *
 * Only called from admin-triggered actions (panel download / email), never on a request path
 * that needs to be fast - a full dump of a real dining database can take a while.
 */
class DatabaseBackupService
{
    public function createDump(): string
    {
        $connection = config('database.connections.' . config('database.default'));
        if (($connection['driver'] ?? null) !== 'mysql') {
            throw new RuntimeException('Database backup only supports the mysql driver.');
        }

        $directory = storage_path('app/database-backups');
        if (!is_dir($directory)) {
            mkdir($directory, 0755, true);
        }

        $path = $directory . DIRECTORY_SEPARATOR . $this->fileName();

        $command = [
            $this->resolveMysqldumpBinary(),
            '--host=' . $connection['host'],
            '--port=' . $connection['port'],
            '--user=' . $connection['username'],
            '--single-transaction',
            '--routines',
            '--events',
            '--default-character-set=utf8mb4',
            $connection['database'],
        ];

        $process = new Process($command, null, $this->processEnv($connection));
        $process->setTimeout(600);
        $process->disableOutput();

        $handle = fopen($path, 'wb');
        $process->run(function ($type, $buffer) use ($handle) {
            if ($type === Process::OUT) {
                fwrite($handle, $buffer);
            }
        });
        fclose($handle);

        if (!$process->isSuccessful()) {
            @unlink($path);
            throw new RuntimeException('mysqldump failed: ' . $process->getErrorOutput());
        }

        // A dump that errored out mid-stream still leaves a file behind - the same "we had
        // backups that turn out to be a 400-byte error header" trap the nightly backup.cmd
        // guards against.
        if (!is_file($path) || filesize($path) < 1024) {
            @unlink($path);
            throw new RuntimeException('Database dump looks incomplete (file too small).');
        }

        return $path;
    }

    public function fileName(): string
    {
        return 'dining-' . now()->format('Y-m-d_His') . '.sql';
    }

    private function processEnv(array $connection): array
    {
        // MYSQL_PWD instead of --password= on the command line - the latter is visible to
        // anyone who can list processes on the machine.
        $env = [];
        if (!empty($connection['password'])) {
            $env['MYSQL_PWD'] = $connection['password'];
        }
        return $env;
    }

    private function resolveMysqldumpBinary(): string
    {
        if ($configured = env('MYSQLDUMP_PATH')) {
            return $configured;
        }

        // The counter-PC installer lays out runtime/mysql/bin as a sibling of backend/ - see
        // installer/dining.iss. Fall back to relying on PATH everywhere else (e.g. a hosted
        // deployment with a system-installed mysqldump).
        $binaryName = PHP_OS_FAMILY === 'Windows' ? 'mysqldump.exe' : 'mysqldump';
        $bundled = base_path('..' . DIRECTORY_SEPARATOR . 'runtime' . DIRECTORY_SEPARATOR . 'mysql'
            . DIRECTORY_SEPARATOR . 'bin' . DIRECTORY_SEPARATOR . $binaryName);

        return is_file($bundled) ? $bundled : 'mysqldump';
    }
}
