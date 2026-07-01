<?php

namespace App\Console\Commands\Scaffold;

use Illuminate\Console\GeneratorCommand;

class ValidatorMakeCommand extends GeneratorCommand
{
    protected $signature = 'imake:validator
                            {name : validator name, e.g. SampleValidator}';

    protected $description = 'Create a new form request class';

    protected $type = 'Request';

    protected function getStub()
    {
        return __DIR__.'/stubs/validators/validator.stub';
    }

    protected function getDefaultNamespace($rootNamespace)
    {
        return $rootNamespace.'\Validators';
    }
}
