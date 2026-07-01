<?php

namespace App\Repositories;

use App\Models\File;
use App\Services\ODataService;

class FileRepository extends BaseRepository
{
    /**
     * @var File
     */
    protected $model;

    protected $request;

    protected $oDataService;

    protected $fieldSearchable = ['filename'];

    public function __construct()
    {
        $this->model        = new File();
    }

    protected function init()
    {
        $this->request = request();
        $this->oDataService = (new ODataService())->init();
    }

    public function getFileInfo($fileId)
    {
        return $this->findWhereFirst('file_id', $fileId);
    }

    public function getFilePath($fileId)
    {
        try {
            $fileInfo = $this->getFileInfo($fileId);
            return storage_path('app/public/' . $fileInfo->file_path);
        } catch (\Exception $e) {
            return "";
        }
    }

    public function getFilePathUrl($fileId)
    {
        try {
            $fileInfo = $this->getFileInfo($fileId);
            return url('storage/' . $fileInfo->file_path);
        } catch (\Exception $e) {
            return "";
        }
    }
}
