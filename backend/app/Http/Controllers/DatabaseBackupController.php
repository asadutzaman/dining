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
}
