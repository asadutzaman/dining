<?php

namespace App\Console\Commands\Scaffold;

use Illuminate\Console\GeneratorCommand;

class TraitMakeCommand extends GeneratorCommand
{
    protected $signature = 'imake:trait
                            {name : trait name, e.g. SampleTrait}';

    protected $description = 'Create a new trait';

    protected $type = 'Trait';

    protected function getStub()
    {
        return __DIR__.'\stubs\traits\trait.stub';
    }

    protected function getDefaultNamespace($rootNamespace)
    {
        return $rootNamespace.'\Traits';
    }
}
