<?php

namespace App\Interfaces;

interface FileServiceInterface
{
    public function uploadFile($configKey, $path, $mediaType, $ext, $storageInfo);

    public function uploadImage($configKey, $path, $mediaType, $ext, $storageInfo);

    public function uploadBase64Image($file);

    public function uploadVideo($file, $savePath, $prefix = '');

    public function uploadFolder($configKey, $path, $mediaType, $ext, $storageInfo);

    public function saveFileFromUrl($url, $path, $name);

    public function generateFileName($seed, $postFix, $ext);

    public function getFile($id);

    public function getImage($id);

    public function getFileInfo($fileId);

    public function getDownloadUrl($fileId);

    public function downloadFile($id);

    public function downloadDirectory($id);

    public function deleteFile($fileId, $httpResponse = true);

    public function copyFile($fileId, $newPath);

    public function moveFile($fileId, $newPath);

    public function renameFile(string $newName);

    public function trashFile($fileId);

    public function restoreFile($fileId);

    public function checkFileSize(int $allowedByteNumber): bool;

    public function checkFileType($filename,$types);

    public function checkFileExist($filename);

    public function checkDirectoryExist(string $path, string $disk = 'public'): bool;

    public function createDirectory($directoryName, $path = null, $parentId = null, $httpResponse = true);

    public function createDirIfNotExist(string $dir): void;

    public function clear();

    public function clearExpiredFiles();

    public function clearStorage();

}
