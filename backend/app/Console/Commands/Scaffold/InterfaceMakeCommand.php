<?php

namespace App\Console\Commands\Scaffold;

use Illuminate\Console\GeneratorCommand;

class InterfaceMakeCommand extends GeneratorCommand
{
    protected $signature = 'imake:interface
                            {name : controller name, e.g. SampleController}';

    protected $description = 'Create a new interface class';

    protected $type = 'Interface';

    protected function getStub()
    {
        return __DIR__ . '/stubs/interface/interface.stub';
    }

    protected function getDefaultNamespace($rootNamespace)
    {
        return $rootNamespace.'\Http\Interfaces';
    }

}
