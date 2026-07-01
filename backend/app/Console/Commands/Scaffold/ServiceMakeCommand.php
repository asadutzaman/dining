<?php

namespace App\Console\Commands\Scaffold;

use Illuminate\Console\GeneratorCommand;

class ServiceMakeCommand extends GeneratorCommand
{
    protected $signature = 'imake:service
                            {name : service name, e.g. SampleService}';

    protected $description = 'Create a new Service class.';

    protected $type = 'Service';

    protected function getStub()
    {
        return  __DIR__.'/stubs/services/service.stub';
    }

    protected function getDefaultNamespace($rootNamespace)
    {
        return $rootNamespace.'\Services';
    }
}
