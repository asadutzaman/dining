<?php

namespace App\Console\Commands\Scaffold;

use Illuminate\Console\GeneratorCommand;

class HelperMakeCommand extends GeneratorCommand
{
    protected $signature = 'imake:helper
                            {name : helper name, e.g. SampleHelper}';

    protected $description = 'Create a new helper class';

    protected $type = 'Helper';

    protected function getStub()
    {
        return  __DIR__.'/stubs/helpers/helper.stub';
    }

    protected function getDefaultNamespace($rootNamespace)
    {
        return $rootNamespace.'\Helpers';
    }
}
