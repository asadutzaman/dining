<?php

namespace App\Services;

class ApiHelperService
{
    public static function getFieldsFromArray($data, $fields=['id'])
    {
        if (empty($data)) {
            return [];
        }

        $isCollection = isset($data[0]) && is_array($data[0]) ? true : false;

        if ($isCollection) {
            $ids = [];
            foreach($fields as $field)
            {
                $value = array_column($data, $field);
                if(!empty($value))
                {
                    $ids = array_merge($ids, $value);
                }
            }
        }
        else {
            $ids = [];
            foreach($fields as $field)
            {
                $value = isset($data[$field]) ? $data[$field] : null;
                if(!empty($value))
                {
                    $ids[] = $value;
                }
            }
        }

        $ids = array_filter($ids, 'strlen');
        $ids = array_unique($ids);

        return !empty($ids) ? $ids : null;
    }

    public static function getPromiseResponse($responses, $promiseKey)
    {
        if (isset($responses[$promiseKey]) && array_key_exists('value', $responses[$promiseKey])) {
            $responseData = json_decode($responses[$promiseKey]['value']->getBody()->getContents(), true);
            return isset($responseData['results']) ? $responseData['results'] : [];
        }

        return null;
    }

    public static function appendPromiseResponse($resource, $responses, $promiseKey, $resourceFieldName, $responseFieldName, $appendFields)
    {
        if (ArrayService::findKey($resource, $resourceFieldName)) {
            $recordList = ApiHelperService::getPromiseResponse($responses, $promiseKey);

            $isCollection = isset($resource[0]) && is_array($resource[0]) ? true : false;
            if ($isCollection) {
                foreach ($resource as $key => $item) {
                    $index = isset($item[$resourceFieldName]) && !empty($recordList) ? array_search($item[$resourceFieldName], array_column($recordList, $responseFieldName)) : null;
                    foreach ($appendFields AS $resourceKey => $recordKey) {
                        if (is_array($recordKey)) {
                            $recordArrayValue = [];
                            foreach ($recordKey AS $recordArrayKey) {
                                $recordValue = (is_numeric($index) && isset($recordList[$index][$recordArrayKey])) ? $recordList[$index][$recordArrayKey] : '';
                                if ($recordValue) {
                                    $recordArrayValue[] = $recordValue;
                                }
                            }
                            $resource[$key][$resourceKey] = implode(' ', $recordArrayValue);
                        }
                        else {
                            $resource[$key][$resourceKey] = (is_numeric($index) && isset($recordList[$index][$recordKey])) ? $recordList[$index][$recordKey] : '';
                        }
                    }
                }
            }
            else {
                $index = isset($resource[$resourceFieldName]) && !empty($recordList) ? array_search($resource[$resourceFieldName], array_column($recordList, $responseFieldName)) : null;
                foreach ($appendFields AS $resourceKey => $recordKey) {
                    if (is_array($recordKey)) {
                        $recordArrayValue = [];
                        foreach ($recordKey AS $recordArrayKey) {
                            $recordValue = (is_numeric($index) && isset($recordList[$index][$recordArrayKey])) ? $recordList[$index][$recordArrayKey] : '';
                            if ($recordValue) {
                                $recordArrayValue[] = $recordValue;
                            }
                        }
                        $resource[$resourceKey] = implode(' ', $recordArrayValue);
                    }
                    else {
                        $resource[$resourceKey] = (is_numeric($index) && isset($recordList[$index][$recordKey])) ? $recordList[$index][$recordKey] : '';
                    }
                }
            }
        }

        return $resource;
    }

}
