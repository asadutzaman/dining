<?php

namespace App\Console\Commands\Scaffold;

use Illuminate\Console\GeneratorCommand;
use Symfony\Component\Console\Input\InputOption;

class ControllerMakeCommand extends GeneratorCommand
{
    protected $signature = 'imake:controller
                            {name : controller name, e.g. SampleController}
                            {--model= : The name of the model}';

    protected $description = 'Create a new controller class';

    protected $type = 'Controller';

    protected function getStub()
    {
        return __DIR__.'/stubs/controllers/controller.stub';
    }

    protected function getDefaultNamespace($rootNamespace)
    {
        return $rootNamespace.'\Http\Controllers';
    }

    protected function buildClass($name)
    {
        $replace = $this->buildReplacements();

        return str_replace(
            array_keys($replace), array_values($replace), parent::buildClass($name)
        );
    }

    protected function buildReplacements()
    {
        $modelName = trim($this->option('model'));
        return [
            'DummyRepositoryClass' => $modelName . 'Repository',
            'DummyResourceClass'   => $modelName . 'Resource',
            'DummyValidatorClass'  => $modelName . 'Validator'
        ];
    }
}
