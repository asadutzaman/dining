<?php

namespace App\Interfaces;

interface JsonServiceInterface
{

    public function setErrors($array);
    public function setResponseCode($code = 200);
    public function render();
    public function jsonSuccess($message, $data);
    public function jsonError($message, $code = 422);

    public function encode($value);
    public function decode($jsonString);
    public function getDecodedData();

    public function loadJsonFile(string $jsonFileName);
    public function parseAnswers(array $answers, int $parentId);

    public function response($code=1, $data=null, $msg='');
    public function getJson();
    public function getJsonFromClient() ;

}
