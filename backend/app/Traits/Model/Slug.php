<?php

namespace App\Traits\Model;

use Illuminate\Database\Eloquent\Model;

trait Slug
{
    protected static function bootSlug()
    {
        static::creating(function (Model $model) {
            $model->generateUniqueSlug();
        });
        static::saving(function (Model $model) {
            $model->generateUniqueSlug();
        });
        static::updating(function (Model $model) {
            $model->generateUniqueSlug();
        });
    }

    protected function generateUniqueSlug()
    {
        $slug_from_key = 'name';

        //update slug nur wenn title sich geändert hat
        if ($this->isDirty($slug_from_key) or empty($this->slug)) {
            $first_slug = str_slug($this->$slug_from_key);
            $slug = $first_slug;
            while ($this->otherRecordExistsWithSlug($slug) || $slug === '') {
                $slug = ($slug ? $first_slug . '-' : "") . rand(1E5, 1E7);
            }
            $this->slug = $slug;
        }
    }

    protected function otherRecordExistsWithSlug($slug)
    {
        return (bool)static::whereSlug($slug)->first();
    }

}
