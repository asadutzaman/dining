<?php

namespace App\Console\Commands\Scaffold;

use Illuminate\Console\GeneratorCommand;
use Symfony\Component\Console\Input\InputOption;

class FactoryMakeCommand extends GeneratorCommand
{
    protected $signature = 'imake:factory
                            {name : Factory name, e.g. SampleFactory}
                            {--model= : The name of the model}';

    protected $description = 'Create a new model factory';

    protected $type = 'Factory';

    protected function getStub()
    {
        return  __DIR__.'/stubs/factories/factory.stub';
    }

    protected function buildClass($name)
    {
        $namespaceModel = $this->option('model') ?  $this->qualifyClass($this->option('model')) : trim($this->rootNamespace(), '\\').'\\Model';
        $model = class_basename($namespaceModel);
        return str_replace(
            [
                'NamespacedDummyModel',
                'DummyModel',
            ],
            [
                $namespaceModel,
                $model,
            ],
            parent::buildClass($name)
        );
    }

    protected function getPath($name)
    {
        $name = str_replace(['\\', '/'], '', $this->argument('name'));
        return $this->laravel->databasePath()."/factories/{$name}.php";
    }

    protected function getDefaultNamespace($rootNamespace)
    {
        return $rootNamespace;
    }
}
