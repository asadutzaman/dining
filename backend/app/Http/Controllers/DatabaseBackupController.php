<?php

namespace App\Http\Controllers;

use App\Mail\DatabaseBackupMail;
use App\Services\DatabaseBackupService;
use App\Traits\Controller\Functions\TraitRestResponse;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class DatabaseBackupController extends Controller
{
    use TraitRestResponse;

    public function index()
    {
        return $this->successResponse(['available' => true]);
    }

    public function download(DatabaseBackupService $service)
    {
        ini_set('max_execution_time', 0);

        try {
            $path = $service->createDump();
        } catch (Exception $e) {
            Log::error('Database backup download failed: ' . $e->getMessage());
            $this->errorResponse('Could not generate the database backup.');
        }

        return response()->download($path, basename($path))->deleteFileAfterSend(true);
    }

    public function email(Request $request, DatabaseBackupService $service)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        ini_set('max_execution_time', 0);

        $path = null;
        try {
            $path = $service->createDump();
            Mail::to($request->input('email'))->send(new DatabaseBackupMail($path, basename($path)));
        } catch (Exception $e) {
            Log::error('Database backup email failed: ' . $e->getMessage());
            $this->errorResponse('Could not send the database backup by email.');
        } finally {
            if ($path && is_file($path)) {
                @unlink($path);
            }
        }

        return $this->successResponse(['message' => 'Database backup sent to ' . $request->input('email') . '.']);
    }

    /**
     * Replaces the whole database with an uploaded .sql file. Destructive by design - the
     * frontend is expected to make the admin confirm explicitly before ever calling this.
     */
    public function restore(Request $request, DatabaseBackupService $service)
    {
        $request->validate([
            'file' => ['required', 'file', 'max:512000'],
        ]);

        $file = $request->file('file');
        if (strtolower($file->getClientOriginalExtension()) !== 'sql') {
            $this->errorResponse('Please upload a .sql file.');
        }

        ini_set('max_execution_time', 0);

        try {
            $safetyBackupPath = $service->restoreDump($file->getRealPath());
        } catch (Exception $e) {
            Log::error('Database restore failed: ' . $e->getMessage());
            $this->errorResponse($e->getMessage());
        }

        Log::warning('Database restored from an admin-panel upload. Safety backup: ' . basename($safetyBackupPath));

        return $this->successResponse([
            'message' => 'Database restored successfully.',
            'safety_backup' => basename($safetyBackupPath),
        ]);
    }
}
