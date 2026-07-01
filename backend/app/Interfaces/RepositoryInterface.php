<?php

namespace App\Interfaces;

use Illuminate\Database\Eloquent\Model;

/**
 * Interface RepositoryInterface
 *
 * @package App\Interfaces
 */
interface RepositoryInterface
{
    /**
     * Retrieve all data of repository
     *
     * @param array $columns
     *
     * @return mixed
     */
    public function all($columns = ['*']);

    /**
     * Find data by id
     *
     * @param       $id
     * @param array $columns
     *
     * @return mixed
     */
    public function find($id, $columns = ['*']);

    /**
     * Save a new entity in repository
     *
     * @param array $attributes
     *
     * @return mixed
     */
    public function create(array $attributes);

    /**
     * Update a entity in repository by id
     *
     * @param array $attributes
     * @param       $id
     *
     * @return mixed
     */
    public function update(array $attributes, $id);

    /**
     * @param string $id
     *
     * @return bool|null
     */
    public function deleteById(string $id);

    /**
     * @param Model $model
     *
     * @return bool|null
     */
    public function delete(Model $model);
}
