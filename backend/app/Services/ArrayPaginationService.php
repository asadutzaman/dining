<?php

namespace App\Services;

class ArrayPaginationService
{
    public function paginate($items, $skip, $top, $total=null)
    {
        $totalCount     = $total ? $total : count($items);
        $perPage        = isset($top)  ? $top : $totalCount;
        $pageCount      = isset($top)  ? ceil($totalCount / $perPage) : 1;
        $currentPage    = isset($skip) ? ceil($skip / $perPage) : 1;

        if(empty($total) && !empty($skip)) {
            $items = $this->skip($items, $skip);
        }
        if(empty($total) && !empty($top)) {
            $items = $this->take($items, $top);
        }

        return [
            'meta' => [
                'totalCount'  => $totalCount,
                'pageCount'   => $pageCount,
                'currentPage' => $currentPage,
                'perPage'     => $perPage,
            ],
            'results' => $items,
        ];
    }

    public function skip($items, $skip)
    {
        return array_slice($items, $skip);
    }

    public function take($items, $take)
    {
        return array_slice($items, 0, $take);
    }

}
