<?php

namespace App\Services;

class ResourceService {

    public static function getResources($object, $resourceClass)
    {
        if (empty($object)) {
            return $object;
        }

        $dataResource = new $resourceClass($object);
        $jsonResponse = response()->json($dataResource)->getData();

        $responseArray = json_decode(json_encode($jsonResponse), true);
        $resource = $resourceClass::withApiRelationalData($responseArray);

        return (object) $resource;
    }

    public static function getResourceCollection($object, $resourceClass)
    {
        if (empty($object)) {
            return $object;
        }

        $dataResource = $resourceClass::collection($object);
        $jsonResponse = response()->json($dataResource)->getData();

        $responseArrayList = json_decode(json_encode($jsonResponse), true);
        $resourceList = $resourceClass::withApiRelationalData($responseArrayList);

        return $resourceList;
    }
}
