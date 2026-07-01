<?php

namespace App\Services;

use Intervention\Image\Facades\Image;

class StorageService
{
    public $compressImage = true;

    public $imageQuality = 80;

    public function upload($file, $fileName, $path)
    {
        if ($this->isImage($fileName)) {
          $this->uploadImage($file, $fileName, $path);
        }
        else {
            $this->uploadFile($file, $fileName, $path);
        }
    }

    public function uploadImage($file, $fileName, $path)
    {
        $image = Image::make($file->getRealPath());
        $imagePath = $path . '/' . $fileName;
        if ($this->compressImage) {
            $image->save($imagePath, $this->imageQuality);
        }
        else {
            $this->uploadFile($file, $fileName, $path);
        }
    }

    public function uploadFile($file, $fileName, $path)
    {
        $file->move($path, $fileName);
    }

    public function getUploadDirectory($fileName, $componentName)
    {
        $year = date('Y');
        $month = date('m');
        $day = date('d');

        $fileName = self::convertNameFile($fileName);
        $fileName = trim(strtolower($fileName));

        $dir1 = substr($fileName, 0, 2);
        $dir1 = str_pad($dir1, 2 , '0');

        $dir2 = substr($fileName, 2, 3);
        $dir2 = str_pad($dir2, 3 , '0');

        return $componentName . '/' . $year . '/' . $month . '/' . $day . '/' . $dir1 . '/' . $dir2;
    }

    public static function convertNameFile($name)
    {
        $name = preg_replace('/[\/\s]+/', '_', $name);
        $name = preg_replace('/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/', "a", $name);
        $name = preg_replace('/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/', "e", $name);
        $name = preg_replace('/ì|í|ị|ỉ|ĩ/', "i", $name);
        $name = preg_replace('/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/', "o", $name);
        $name = preg_replace('/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/', "u", $name);
        $name = preg_replace('/ỳ|ý|ỵ|ỷ|ỹ/', "y", $name);
        $name = preg_replace('/đ/', "d", $name);
        $name = preg_replace('/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/', "A", $name);
        $name = preg_replace('/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/', "E", $name);
        $name = preg_replace('/Ì|Í|Ị|Ỉ|Ĩ/', "I", $name);
        $name = preg_replace('/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/', "O", $name);
        $name = preg_replace('/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/', "U", $name);
        $name = preg_replace('/Ỳ|Ý|Ỵ|Ỷ|Ỹ/', "Y", $name);
        $name = preg_replace('/Đ/', "D", $name);
        $name = preg_replace("/'/", "", $name);
        $name = preg_replace('/"/', "", $name);
        return $name;
    }

    public function isImage($fileName)
    {
        $imageExtensions = ['jpg', 'jpeg', 'gif', 'png', 'bmp', 'svg', 'svgz', 'cgm', 'djv', 'djvu', 'ico', 'ief','jpe', 'pbm', 'pgm', 'pnm', 'ppm', 'ras', 'rgb', 'tif', 'tiff', 'wbmp', 'xbm', 'xpm', 'xwd','webp'];
        $ext = pathinfo($fileName, PATHINFO_EXTENSION);
        return in_array($ext, $imageExtensions);
    }

}
