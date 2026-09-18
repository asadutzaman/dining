<?php

namespace App\Services;

use RuntimeException;
use Symfony\Component\Process\Process;

/**
 * Dumps/restores the whole app database via the server's mysqldump/mysql binaries.
 *
 * Only called from admin-triggered actions (panel download / email / restore), never on a
 * request path that needs to be fast - a full dump of a real dining database can take a while.
 */
class DatabaseBackupService
{
    public function createDump(): string
    {
        $connection = $this->mysqlConnection();

        $directory = storage_path('app/database-backups');
        if (!is_dir($directory)) {
            mkdir($directory, 0755, true);
        }

        $path = $directory . DIRECTORY_SEPARATOR . $this->fileName();

        $command = [
            $this->resolveBinary('mysqldump'),
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

    /**
     * Replaces the whole database with the contents of an uploaded .sql file.
     *
     * Always takes a safety dump first and keeps it (never auto-deleted) - an upload that turns
     * out to be a stale backup would otherwise silently erase every member/token/payment added
     * since, exactly the kind of mistake a bad dump caused on this deployment before.
     *
     * @return string Path to the safety backup taken just before the restore.
     */
    public function restoreDump(string $sqlFilePath): string
    {
        $connection = $this->mysqlConnection();
        $this->assertLooksLikeSqlDump($sqlFilePath);

        $safetyBackupPath = $this->createDump();

        $command = [
            $this->resolveBinary('mysql'),
            '--host=' . $connection['host'],
            '--port=' . $connection['port'],
            '--user=' . $connection['username'],
            '--default-character-set=utf8mb4',
            $connection['database'],
        ];

        $handle = fopen($sqlFilePath, 'rb');
        $process = new Process($command, null, $this->processEnv($connection));
        $process->setTimeout(600);
        $process->setInput($handle);
        $process->run();
        fclose($handle);

        if (!$process->isSuccessful()) {
            throw new RuntimeException(
                'Restore failed: ' . $process->getErrorOutput()
                . ' A safety backup of the data as it was before this run was saved as '
                . basename($safetyBackupPath) . '.'
            );
        }

        return $safetyBackupPath;
    }

    public function fileName(): string
    {
        return 'dining-' . now()->format('Y-m-d_His') . '.sql';
    }

    private function mysqlConnection(): array
    {
        $connection = config('database.connections.' . config('database.default'));
        if (($connection['driver'] ?? null) !== 'mysql') {
            throw new RuntimeException('Database backup only supports the mysql driver.');
        }
        return $connection;
    }

    /**
     * A dump the source database never actually finished writing, or a completely unrelated
     * file, would otherwise be fed straight into `mysql` - which restore already treats as
     * DROP-and-recreate-everything.
     */
    private function assertLooksLikeSqlDump(string $path): void
    {
        $handle = fopen($path, 'rb');
        $head = $handle ? fread($handle, 8192) : '';
        if ($handle) {
            fclose($handle);
        }

        if (stripos($head, 'MySQL dump') === false && stripos($head, 'CREATE TABLE') === false) {
            throw new RuntimeException('This file does not look like a MySQL dump.');
        }
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

    /**
     * @param 'mysql'|'mysqldump' $tool
     */
    private function resolveBinary(string $tool): string
    {
        // The config() helper, not the raw environment-variable helper - reading the
        // environment directly outside config/ silently returns null once config caching has
        // run, which the installer always does after install.
        $configKey = $tool === 'mysqldump' ? 'services.database_backup.mysqldump_path' : 'services.database_backup.mysql_client_path';
        if ($configured = config($configKey)) {
            return $configured;
        }

        // The counter-PC installer lays out runtime/mysql/bin as a sibling of backend/ - see
        // installer/dining.iss. Fall back to relying on PATH everywhere else (e.g. a hosted
        // deployment with a system-installed mysql client).
        $binaryName = $tool . (PHP_OS_FAMILY === 'Windows' ? '.exe' : '');
        $bundled = base_path('..' . DIRECTORY_SEPARATOR . 'runtime' . DIRECTORY_SEPARATOR . 'mysql'
            . DIRECTORY_SEPARATOR . 'bin' . DIRECTORY_SEPARATOR . $binaryName);

        return is_file($bundled) ? $bundled : $tool;
    }
}
