<?php

namespace App\Console\Commands\Scaffold;

use Illuminate\Console\GeneratorCommand;
use Illuminate\Support\Str;

class TestMakeCommand extends GeneratorCommand
{
    protected $signature = 'imake:test
                            {name : The name of the class}
                            {--unit : Create a unit test}';

    protected $description = 'Create a new test class';

    protected $type = 'Test';

    protected function getStub()
    {
        if ($this->option('unit')) {
            return __DIR__.'/stubs/testcases/unit-test.stub';
        }

        return __DIR__.'/stubs/testcases/test.stub';
    }

    protected function getPath($name)
    {
        $name = Str::replaceFirst($this->rootNamespace(), '', $name);

        return base_path('tests').str_replace('\\', '/', $name).'.php';
    }

    protected function getDefaultNamespace($rootNamespace)
    {
        if ($this->option('unit')) {
            return $rootNamespace.'\Unit';
        } else {
            return $rootNamespace.'\Feature';
        }
    }

    protected function rootNamespace()
    {
        return 'Tests';
    }
}
