<?php

namespace App\Services\Dining;

use App\Repositories\FileRepository;
use App\Services\StorageService;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Copies a member's NCMS photo into local file storage at enrollment time.
 *
 * Hot-linking the NCMS image URL would not work: the image host (192.168.100.252:8081) is a
 * different box from the API host and is not necessarily reachable from an operator's browser.
 * Storing it locally produces a normal photo_id that the existing /api/file/view/{id} route serves.
 *
 * Deliberately fetched one member at a time, at enrollment -- not for all ~1000 candidates
 * during a roster sync.
 */
class NcmsPhotoService
{
    private $fileRepository;

    private $storageService;

    public function __construct(FileRepository $fileRepository)
    {
        $this->fileRepository = $fileRepository;
        $this->storageService = new StorageService();
    }

    /**
     * @return string|null the file_id, or null if the photo could not be fetched
     */
    public function importFromUrl(?string $url, ?int $ownerId = null): ?string
    {
        if (empty($url)) {
            return null;
        }

        try {
            $response = Http::timeout(20)->get($url);

            if (!$response->successful()) {
                Log::warning("NCMS photo fetch failed ({$response->status()}): {$url}");
                return null;
            }

            $body = $response->body();
            if ($body === '') {
                return null;
            }

            $mimeType = $response->header('Content-Type') ?: 'image/jpeg';
            if (!Str::startsWith($mimeType, 'image/')) {
                Log::warning("NCMS photo was not an image ({$mimeType}): {$url}");
                return null;
            }

            $originalFilename = basename(parse_url($url, PHP_URL_PATH) ?: 'photo.jpg');
            $ext = strtolower(pathinfo($originalFilename, PATHINFO_EXTENSION)) ?: 'jpg';
            $fileName = time() . '_' . str_replace(' ', '', $originalFilename);

            $fileDir  = $this->storageService->getUploadDirectory($originalFilename, 'Member');
            $filePath = 'uploads/' . $fileDir . '/' . $fileName;
            $path     = storage_path('app/public/uploads/' . $fileDir);

            if (!file_exists($path)) {
                mkdir($path, 0777, true);
            }

            file_put_contents($path . '/' . $fileName, $body);

            $file = $this->fileRepository->create([
                'file_id'           => uniqid(),
                'filename'          => $fileName,
                'original_filename' => $originalFilename,
                'file_type'         => $ext,
                'mime_type'         => $mimeType,
                'file_path'         => $filePath,
                'file_url'          => $filePath,
                'ext'               => $ext,
                'size'              => strlen($body),
                'owner_id'          => $ownerId,
            ]);

            return $file ? $file->file_id : null;
        } catch (\Exception $e) {
            // A missing photo must never block an enrollment: at the counter that would mean
            // refusing someone a meal because a picture failed to download.
            Log::warning('NCMS photo import failed: ' . $e->getMessage(), ['url' => $url]);
            return null;
        }
    }
}
