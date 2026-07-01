<?php

namespace App\Console\Commands\Scaffold;

use Illuminate\Support\Str;
use Illuminate\Console\GeneratorCommand;
use Symfony\Component\Console\Input\InputOption;

class ResourceMakeCommand extends GeneratorCommand
{
    protected $signature = 'imake:resource
                            {name : resource name, e.g. SampleResource}
                            {--collection= : The name of the collection}';

    protected $description = 'Create a new resource';

    protected $type = 'Resource';

    protected function getStub()
    {
        return $this->collection() ? __DIR__ . '/stubs/resources/resource-collection.stub' : __DIR__ . '/stubs/resources/resource.stub';
    }

    public function handle()
    {
        if ($this->collection()) {
            $this->type = 'Resource collection';
        }

        parent::handle();
    }

    protected function buildClass($name)
    {
        if ($this->collection()) {
            $replace = [
                'ResourceClass' => str_replace('Collection', 'Resource', $this->argument('name'))
            ];

            return str_replace(
                array_keys($replace), array_values($replace), parent::buildClass($name)
            );
        }
        else {
            return parent::buildClass($name);
        }
    }

    protected function collection()
    {
        return $this->option('collection') || Str::endsWith($this->argument('name'), 'Collection');
    }

    protected function getDefaultNamespace($rootNamespace)
    {
        return $rootNamespace . '\Http\Resources';
    }

}
