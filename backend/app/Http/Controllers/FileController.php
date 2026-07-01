<?php

namespace App\Http\Controllers;

use App\Exceptions\ValidatorException;
use App\Http\Resources\FileResource;
use App\Repositories\FileRepository;
use App\Services\JwtService;
use App\Services\StorageService;
use App\Traits\Controller\RestControllerTrait;
use App\Validators\FileValidator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\File;
use Illuminate\Validation\ValidationException;

class FileController extends Controller
{
    private $repository;

    private $validator;

    private $resource;

    private $partialUpdateFields = ['filename', 'file_type'];

    use RestControllerTrait;

    public function __construct(FileRepository $repository, FileValidator $validator)
    {
        $this->repository = $repository;
        $this->validator = $validator;
        $this->resource = FileResource::class;
    }

    public function upload(Request $request)
    {
        try {
            // Validation
            $this->validate($request, [
               'file' => 'required|mimes:jpg,jpeg,png,mp4,mov,pdf,doc,docx,ppt,xlsx,csv,txt,json,zip,rar,tar',
            ]);

            $storageService = new StorageService();

            // File Instance
            $file = $request->file('file');

            // Filename
            $originalFilename = $file->getClientOriginalName();
            $fileName = $originalFilename;
            $fileName = str_replace(" ", "", $fileName);
            $fileName = time() . '_' . trim($fileName);

            $ext        = $file->extension();
            $fileType   = $file->getClientOriginalExtension();
            $mimeType   = $file->getClientMimeType();
            $size       = $file->getSize();

            $componentName = $request->post('componentName', 'Common');
            $fileDir = $storageService->getUploadDirectory($originalFilename, $componentName);
            $filePath   = 'uploads/' . $fileDir . '/' . $fileName;
            $fileUrl    = 'uploads/' . $fileDir . '/' . $fileName;

            $uploadDir = 'app/public/uploads/' . $fileDir;
            $path = storage_path($uploadDir);
            if (!file_exists($path)) {
                mkdir($path, 0777, true);
            }

            // Upload  File
            $storageService->upload($file, $fileName, $path);

            // Save File Database
            $jwtService = new JwtService();
            $tokenInfo = $jwtService->getTokeInfo();
            $ownerId = isset($tokenInfo->id) ? $tokenInfo->id : null;

            $fileData = [
                'file_id'           => uniqid(),
                'filename'          => $fileName,
                'original_filename' => $originalFilename,
                'file_type'         => $fileType,
                'mime_type'         => $mimeType,
                'file_path'         => $filePath,
                'file_url'          => $fileUrl,
                'ext'               => $ext,
                'size'              => $size,
                'owner_id'          => $ownerId,
            ];

            $result =  $this->repository->create($fileData);
            $response = isset($this->resource) ? new $this->resource($result) : $result;
            return $this->successResponse($response);
        }
        catch (ValidationException $e) {
            throw new ValidatorException($e);
        }
        catch (\Exception $e) {
            $this->errorResponse($e->getMessage());
        }
    }

    public function download($fileId)
    {
        try {
            $fileInfo = $this->repository->findWhereFirst('file_id', $fileId);
            if (!$fileInfo) {
                abort(404);
            }

            $filePath = storage_path('app/public/' . $fileInfo->file_path);
            if (!File::exists($filePath)) {
                abort(404);
            }

            $fileName = $fileInfo->original_filename;

            $headers = [
                'Content-Type' => 'application/*',
            ];

            return response()->download($filePath, $fileName, $headers);
        }
        catch (\Exception $e) {
            $this->errorResponse($e->getMessage());
        }
    }

    public function downloadFile(Request $request)
    {
        try {
            $path = $request->get('path');
            $filePath = storage_path('app/public/' . $path);
            if (!File::exists($filePath)) {
                abort(404);
            }

            $fileName = basename($filePath);

            $headers = [
                'Content-Type' => 'application/*',
            ];

            return response()->download($filePath, $fileName, $headers);
        }
        catch (\Exception $e) {
            $this->errorResponse($e->getMessage());
        }
    }

    public function show($id)
    {
        try {
            $enableCache = $this->repository->getModel()?->enableCache ?? false;
            $cachePrefix = $this->repository->getModel()?->cachePrefix ?? null;
            $cacheControllerMethodList = $this->repository->getModel()?->cacheControllerMethodList ?? null;
            $checkCacheEnable = $enableCache && !empty($cachePrefix) && in_array('show', $cacheControllerMethodList);
            if ($checkCacheEnable) {
                $cacheKey = "{$cachePrefix}.id.{$id}";
                return Cache::remember($cacheKey, Config::get('cache.duration.long'), function() use($id) {
                    $result = $this->repository->findWhereFirst('file_id', $id);
                    $response = isset($this->resource) ? new $this->resource($result) : $result;
                    return $this->successResponse($response);
                });
            }
            else {
                $result = $this->repository->findWhereFirst('file_id', $id);
                $response = isset($this->resource) ? new $this->resource($result) : $result;
                return $this->successResponse($response);
            }
        }
        catch (\Exception $e) {
            $this->errorResponse($e->getMessage());
        }
    }

    public function getMultipleFiles(Request $request)
    {
        try {
            $fileIds = $request->get('fileIds');
            $fileIdArray = explode(',', $fileIds);
            $result['results'] = $this->repository->findWhereIn('file_id', $fileIdArray);

            $response = isset($this->resource) ? $this->resource::collection($result) : $result;
            return $this->successResourceCollectionResponse($response);
        }
        catch (\Exception $e) {
            $this->errorResponse($e->getMessage());
        }
    }

    public function destroy($id)
    {
        try {
            $entity = $this->repository->findWhereFirst('file_id', $id);
            if (!$entity) {
                 $this->notFoundResponse();
            }

            $response = $this->repository->deleteBy('file_id', $id);
            if (!$response) {
                $this->errorResponse();
            }
            return $this->deleteResponse();
        }
        catch (\Exception $e) {
            $this->errorResponse($e->getMessage());
        }
    }

}
