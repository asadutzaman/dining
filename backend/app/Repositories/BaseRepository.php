<?php

namespace App\Repositories;

use App\Services\CacheService;
use App\Services\CommonService;
use App\Services\SessionService;
use Illuminate\Cache\TaggableStore;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

abstract class BaseRepository implements BaseRepositoryInterface
{
    protected $model;

    protected $request;

    protected $oDataService;

    protected $fieldSearchable;

    protected $orgFilterFields = ['organization_id', 'organogram_id'];

    protected function init() {}

    public function getModel()
    {
        return $this->model;
    }

    public function newQuery(): Builder
    {
        return $this->model->newQuery();
    }

    public function all()
    {
        return $this->model->all();
    }

    public function list()
    {
        $query = $this->listQuery();
        $enableCache = $this->getModel()?->enableCache ?? false;
        $cachePrefix = $this->getModel()?->cachePrefix ?? null;
        $cacheControllerMethodList = $this->getModel()?->cacheControllerMethodList ?? null;
        $checkCacheEnable = $enableCache && !empty($cachePrefix) && in_array('index', $cacheControllerMethodList);
        if ($checkCacheEnable && Cache::getStore() instanceof TaggableStore) {
            $cacheKey = CacheService::createCacheKey("{$cachePrefix}.all", [$query->toSql(), $query->getBindings()]);
            return Cache::tags([$cachePrefix])->remember($cacheKey, Config::get('cache.duration.sort'), function () use ($query) {
                return $this->applyPaginate($query);
            });
        } else {
            return $this->applyPaginate($query);
        }
    }

    public function listQuery()
    {
        $this->init();
        $queryParams = $this->oDataService->getQueryParams();
        $oDataParams = $this->oDataService->getODataParams();

        $select     = isset($oDataParams['select'])     ? $oDataParams['select']      : [];
        $search     = isset($oDataParams['search'])     ? $oDataParams['search']      : '';
        $filter     = isset($oDataParams['filter'])     ? $oDataParams['filter']      : [];
        $orderBy    = isset($oDataParams['orderby'])    ? $oDataParams['orderby']     : [];
        $apply      = isset($oDataParams['apply'])      ? $oDataParams['apply']       : [];
        // $compute    = isset($oDataParams['compute'])    ? $oDataParams['compute']     : null;
        // $count      = isset($oDataParams['count'])      ? $oDataParams['count']       : null;
        // $expand     = isset($oDataParams['expand'])     ? $oDataParams['expand']      : null;
        $skip       = isset($oDataParams['skip'])       ? $oDataParams['skip']        : null;
        $top        = isset($oDataParams['top'])        ? $oDataParams['top']         : null;

        $query = $this->newQuery();
        $query = $this->applySelect($query, $select);
        $query = $this->applySearch($query, $search);
        $query = $this->applyFilters($query, $filter);
        $query = $this->applyFilterQueryParams($query, $queryParams);
        $query = $this->applyOrgFilters($query, $filter); //"Attempt to read property \"map\" on array"
        $query = $this->applyAggregates($query, $apply);
        $query = $this->applyOrderBy($query, $orderBy);

        return $query;
    }

    public function getByWhere()
    {
        $this->init();
        $oDataParams = $this->oDataService->getODataParams();

        $select     = isset($oDataParams['select'])     ? $oDataParams['select']      : [];
        $search     = isset($oDataParams['search'])     ? $oDataParams['search']      : '';
        $filter     = isset($oDataParams['filter'])     ? $oDataParams['filter']      : [];

        $query = $this->newQuery();
        $query = $this->applySelect($query, $select);
        $query = $this->applySearch($query, $search);
        $query = $this->applyFilters($query, $filter);

        return $query->first();
    }

    protected function applyPaginate(Builder $query)
    {
        $this->init();
        $oDataParams = $this->oDataService->getODataParams();

        $skip       = isset($oDataParams['skip'])       ? $oDataParams['skip']        : null;
        $top        = isset($oDataParams['top'])        ? $oDataParams['top']         : null;

        $totalCount     = $this->getTotal($query);
        $perPage        = isset($top)  ? $top : $totalCount;
        $pageCount      = isset($top)  ? ceil($totalCount / $perPage) : 1;
        $currentPage    = isset($skip) ? ceil($skip / $perPage) : 1;

        if (!empty($skip)) {
            $query = $query->skip($skip);
        }
        if (!empty($top)) {
            $query = $query->take($top);
        }

        //Debug Info
        $sessionService = (new SessionService())->init();
        $queryString = \App\Services\DebugService::getSqlWithBindings($query);
        $debug = [
            'userId' => $sessionService->getUserId(),
            'organizationId' => $sessionService->getOrganizationId(),
            'organizationIds' => $sessionService->getOrganizationIds(),
            'organogramId' => $sessionService->getOrganogramId(),
            'organogramIds' => $sessionService->getOrganogramIds(),
            'queryString' => $queryString,
            'userToken' => $sessionService->getUserToken(),
        ];

        return [
            'meta' => [
                'totalCount'  => $totalCount,
                'pageCount'   => $pageCount,
                'currentPage' => $currentPage,
                'perPage'     => $perPage,
                'summary'     => [],
                'debug'       => $debug
            ],
            'results' => $query->get(),
        ];
    }

    public function show($id)
    {
        return $this->model->findOrFail($id);
    }

    public function has($relation)
    {
        return $this->model->has($relation);
    }

    public function with(array $tables)
    {
        return $this->model->with($tables);
    }

    public function withShow($relations, $id)
    {
        return $this->model->with($relations)->findOrFail($id);
    }

    public function withCount(array $relationships)
    {
        return $this->model->withCount($relationships);
    }

    public function withTrashed()
    {
        try {
            $this->model = $this->model->withTrashed();
        } catch (\Exception $e) {
        }

        return $this;
    }

    public function onlyTrashed()
    {
        try {
            $this->model = $this->model->onlyTrashed();
        } catch (\Exception $e) {
        }

        return $this;
    }

    public function count()
    {
        return $this->model->count();
    }

    public function countWhere(array $where)
    {
        return $this->model->where($where)->count();
    }

    public function exists(array $where)
    {
        return $this->model->where($where)->exists();
    }

    public function whereJsonContainsExist($field, $value)
    {
        return $this->model->whereJsonContains($field, $value)->exists();
    }

    public function get(array $columns = ['*'])
    {
        return $this->model->get($columns);
    }

    public function getById($id, array $columns = ['*'])
    {
        return $this->model->find($id, $columns);
    }

    public function find(array $data, $columns = ['*'])
    {
        return $this->model->where($data)->get($columns);
    }

    public function findBy($field, $value)
    {
        return $this->model->where($field, '=', $value)->first();
    }

    public function findById($id, $columns = ['*'])
    {
        return $this->model->find($id, $columns);
    }

    public function findWhere($column, $value, $columns = ['*'])
    {
        return $this->model->where($column, $value)->get($columns);
    }

    public function findWhereFirst($column, $value, $columns = ['*'])
    {
        return $this->model->where($column, $value)->firstOrFail($columns);
    }

    public function findWhereIn($field, array $values, $columns = ['*'])
    {
        return $this->model->whereIn($field, $values)->get($columns);
    }

    public function findWhereNotIn($field, array $values, $columns = ['*'])
    {
        return $this->model->whereNotIn($field, $values)->get($columns);
    }

    public function whereNotNull($field)
    {
        return $this->model->whereNotNull($field);
    }

    public function create(array $data)
    {
        return $this->model->create($data);
    }

    public function createWithoutEvents(array $data)
    {
        return $this->model::withoutEvents(function () use ($data) {
            return $this->model->create($data);
        });
    }

    public function updateOrCreate(array $where, array $data)
    {
        return $this->model->updateOrCreate($where, $data);
    }

    public function insert(array $data)
    {
        return $this->model->insert($data);
    }

    public function update(array $data, $id)
    {
        return $this->model->find($id)->update($data);
    }

    public function updateWithoutEvents(array $data, $id)
    {
        return $this->model::withoutEvents(function () use ($data, $id) {
            return $this->model->find($id)->update($data);
        });
    }

    public function updateBy($field, $value, array $data)
    {
        return $this->model->where($field, '=', $value)->update($data);
    }

    public function multiUpdate($column, $value, $input)
    {
        $value = is_array($value) ? $value : [$value];
        return $this->model->whereIn($column, $value)->update($input);
    }

    public function save()
    {
        return $this->model->save();
    }

    public function delete($ids)
    {
        $ids = is_array($ids) ? $ids : [$ids];
        return $this->model->whereIn('id', $ids)->delete();
    }

    public function deleteBy($field, $value)
    {
        return $this->model->where($field, '=', $value)->delete();
    }

    public function deleteByWhere(array $where)
    {
        return $this->model->where($where)->delete();
    }

    public function forceDelete($ids)
    {
        $ids = is_array($ids) ? $ids : [$ids];
        return $this->model->whereIn('id', $ids)->forceDelete();
    }

    public function orderBy($column, $option = 'asc')
    {
        $model = $this->model->orderBy($column, $option);

        return $model;
    }

    public function join($tableName, $tableColumn, $modelColumn, $option = '')
    {
        switch ($option) {
            case 'leftJoin':
                $this->model = $this->model->leftJoin($tableName, $tableColumn, $modelColumn);
                break;

            case 'rightJoin':
                $this->model = $this->model->rightJoin($tableName, $tableColumn, $modelColumn);
                break;

            default:
                $this->model = $this->model->join($tableName, $tableColumn, $modelColumn);
        }

        return $this;
    }

    public function groupBy($columns)
    {
        $columns = is_array($columns) ? $columns : [$columns];
        return $this->model->groupBy($columns);
    }

    public function getTableColumns()
    {
        return Schema::getColumnListing($this->model->getTable());
    }

    public function getTablePrefix()
    {
        // return $this->model->getTable();
        return DB::getTablePrefix();
    }

    protected function getTotal(Builder $query)
    {
        return $query->count();
    }

    protected function applySelect(Builder $query, array $fields): Builder
    {
        if (empty($fields)) {
            return $query;
        }

        return $this->model->select($fields);
    }

    protected function applyOrderBy(Builder $query, array $orders = []): Builder
    {
        $baseTable = $query->getModel()->getTable();
        if (empty($orders)) {
            return $query;
        }

        // Default Order By
        if (empty($orders)) {
            $query = $query->orderBy($baseTable . '.id', 'desc');
            return $query;
        }

        foreach ($orders as $item) {
            $itemOrderBy = explode(' ', $item);
            $query = $query->orderBy($baseTable . '.' . $itemOrderBy[0], $itemOrderBy[1]);
        }
        return $query;
    }

    protected function applyAggregates(Builder $query, array $aggregates = []): Builder
    {
        if (empty($aggregates)) {
            return $query;
        }

        /*
        switch (strtolower($aggregates['key'])) {
            case 'count':
                $query = $query->count();
                break;
            case 'sum':
                $query = $query->sum($aggregates['value']);
                break;
        }
        */

        return $query;
    }

    protected function applyOrgFilters(Builder $query, array $filters = []): Builder
    {
        $sessionService = (new SessionService())->init();

        // FOR ACCESS ALL DATA FOR SUPPER ADMIN
        $userGroupCodeList = $sessionService->getUserGroupCodeList();
        if (in_array(config('app.group_super_admin_code'), $userGroupCodeList)) {
            return $query;
        }

        $organizationIds = $sessionService->getOrganizationIds();
        $organogramIds = $sessionService->getOrganogramIds();
        $baseTable = $query->getModel()->getTable();
        $tablePrefix = $this->getTablePrefix();

        if (!empty($organizationIds)) {
            if (CommonService::hasColumn($query->getModel()->getTable(), 'organization_ids')) {
                if (is_array($organizationIds)) {
                    $organizationIds = array_map('strval', $organizationIds);
                } else {
                    $organizationIds = strval($organizationIds);
                }
                $query->where(function ($subQuery) use ($organizationIds, $baseTable) {
                    $subQuery->whereJsonContains($baseTable . '.organization_ids', $organizationIds)
                        ->orWhereNull($baseTable . '.organization_ids');
                });
            } elseif (in_array('organization_id', $this->orgFilterFields) && CommonService::hasColumn($query->getModel()->getTable(), 'organization_id')) {
                if (is_array($organizationIds)) {
                    $query->whereIn($baseTable . '.organization_id', $organizationIds);
                } else {
                    $query->where($baseTable . '.organization_id', $organizationIds);
                }
            }
        }


        if (!empty($organogramIds) && in_array('organogram_id', $this->orgFilterFields) && CommonService::hasColumn($query->getModel()->getTable(), 'organogram_id')) {
            if (is_array($organogramIds)) {
                $query->where(function ($subQuery) use ($organogramIds, $baseTable) {
                    $subQuery->whereIn($baseTable . '.organogram_id', $organogramIds)
                        ->orWhereNull($baseTable . '.organogram_id');
                });
            } else {
                $query->where(function ($subQuery) use ($organogramIds, $baseTable) {
                    $subQuery->where($baseTable . '.organogram_id', $organogramIds)
                        ->orWhereNull($baseTable . '.organogram_id');
                });
            }
        }

        return $query;
    }

    protected function applyFilters(Builder $query, array $filters = []): Builder
    {
        if (empty($filters)) {
            return $query;
        }

        $rawQuery = '';
        foreach ($filters as $filter) {
            if ($filter == 'and') {
                $rawQuery .= ' AND ';
            } else if ($filter == 'or') {
                $rawQuery .= ' OR ';
            } else {
                $rawQuery .= $filter['var1'] . " " . $filter['op'] . " " . $filter['var2'];
            }
        }

        $query = $query->whereRaw($rawQuery);

        return $query;
    }

    protected function applyFilterQueryParams(Builder $query, array $queryParams = [])
    {
        return $query;
    }

    protected function applySearch(Builder $query, string $search): Builder
    {
        if (empty($search)) {
            return $query;
        }

        if (count($this->fieldSearchable)) {
            $query->where(function (Builder $query) use ($search) {
                foreach ($this->fieldSearchable as $key) {
                    $query->orWhere($key, 'like', "%{$search}%"); //MYSQL - CASE-INSENSITIVE
                    $query->orWhere($key, 'ILike', "%{$search}%"); //POSTGRESQL - CASE-INSENSITIVE
                }
            });
        }

        return $query;
    }

    protected function getTableName()
    {
        $tablePrefix = $this->getTablePrefix();
        $tableName = $this->model->getTable();
        return $tablePrefix . $tableName;
    }
    protected function replaceDbPrefix($rawQuery, $prefix = 'db_prefix')
    {
        $rawQuery = trim($rawQuery);
        $tablePrefix = $this->getTableName();
        return str_replace($prefix, "{$tablePrefix}", $rawQuery);
    }
}
