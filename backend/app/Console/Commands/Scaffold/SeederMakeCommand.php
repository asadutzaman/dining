<?php

namespace App\Console\Commands\Scaffold;

use Illuminate\Console\GeneratorCommand;
use Symfony\Component\Console\Input\InputOption;

class SeederMakeCommand extends GeneratorCommand
{
    protected $signature = 'imake:seeder
                            {name : Seeder name, e.g. SamplesTableSeeder}
                            {--model= : The name of the model}';

    protected $description = 'Create a new seeder class';

    protected $type = 'Seeder';

    protected function getStub()
    {
        return  __DIR__.'/stubs/seeders/seeder.stub';
    }

    protected function getPath($name)
    {
        $name = str_replace($this->laravel->getNamespace(), '', $name);
        return $this->laravel['path'] . '/../database/seeds/' . ucfirst($name) . 'TableSeeder.php';
    }

    protected function replaceClass($stub, $name)
    {
        $name = str_replace($this->laravel->getNamespace(), '', $name);
        $className = ucfirst($name) . 'TableSeeder';
        $modelName = $this->option('model');
        $search = [
            'DummyClass',
            'DummyModel',
        ];

        $replace = [
            $className,
            $modelName
        ];

        return str_replace( $search, $replace, $stub);
    }
}
