<?php

namespace App\Console\Commands\Scaffold;

use Illuminate\Console\GeneratorCommand;

class ProviderMakeCommand extends GeneratorCommand
{
    protected $signature = 'imake:provider
                            {name : provider name, e.g. SampleProvider}';

    protected $description = 'Create a new service provider class';

    protected $type = 'Provider';

    protected function getStub()
    {
        return __DIR__.'/stubs/providers/provider.stub';
    }

    protected function getDefaultNamespace($rootNamespace)
    {
        return $rootNamespace.'\Providers';
    }
}
