<?php

namespace App\Console\Commands\Scaffold;

use Illuminate\Support\Str;
use Illuminate\Console\GeneratorCommand;
use Symfony\Component\Console\Input\InputOption;

class ModelMakeCommand extends GeneratorCommand
{
    protected $signature = 'imake:model
                            {name : Model name, e.g. Sample}
                            {--pivot : Create a new repository class}';

    protected $description = 'Create a new Eloquent model class';

    protected $type = 'Model';

    protected function getStub()
    {
        if ($this->option('pivot')) {
            return __DIR__.'/stubs/models/pivot.model.stub';
        }
        return __DIR__.'/stubs/models/model.stub';
    }

    protected function getDefaultNamespace($rootNamespace)
    {
        return $rootNamespace . '\Models';
    }
}
