<?php

namespace App\Repositories;

interface BaseRepositoryInterface
{
    public function getModel();

    public function newQuery();

    public function all();

    public function list();

    public function has($relation);

    public function with(array $tables);

    public function withShow($relations, $id);

    public function withCount(array $relationships);

    public function withTrashed();

    public function onlyTrashed();

    public function count();

    public function countWhere(array $where);

    public function exists(array $where);

    public function show(int $id);

    public function get(array $columns = ['*']);

    public function getById($id, array $columns = ['*']);

    public function find(array $data, $columns = ['*']);

    public function findById(int $id, $columns = ['*']);

    public function findWhere($column, $value, $columns = ['*']);

    public function findWhereFirst($column, $value, $columns = ['*']);

    public function findWhereIn($field, array $values, $columns = ['*']);

    public function findWhereNotIn($field, array $values, $columns = ['*']);

    public function whereNotNull($field);

    public function create(array $data);

    public function insert(array $data);

    public function update(array $data, int $id);

    public function multiUpdate($column, $value, $input);

    public function save();

    public function delete($ids);

    public function deleteByWhere(array $where);

    public function forceDelete($ids);

    public function orderBy($column, $option = 'asc');

    public function join($tableName, $tableColumn, $modelColumn, $option = '');

    public function groupBy($columns);

    public function getTableColumns();
}
