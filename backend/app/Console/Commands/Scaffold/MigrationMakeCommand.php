<?php

namespace App\Console\Commands\Scaffold;

use Illuminate\Console\GeneratorCommand;

class MigrationMakeCommand extends GeneratorCommand
{
    protected $signature = 'imake:migration
                            {name : The name of the migration}';

    protected $description = 'Create a new migration file';

    protected $type = 'Migration';

    protected function getStub()
    {
        return __DIR__.'/stubs/migrations/migration.stub';
    }

    protected function getPath($name)
    {
        $name = str_replace($this->laravel->getNamespace(), '', $name);
        $datePrefix = date('Y_m_d_His');

        return $this->laravel['path'] . '/../database/migrations/' . $datePrefix . '_create_' . $name . '_table.php';
    }

    protected function replaceClass($stub, $name)
    {
        $name = str_replace($this->laravel->getNamespace(), '', $name);
        $class = 'Create' . ucfirst($name) .'Table';
        $table = $name;

        $search = [
            'DummyClass',
            'DummyTable',
        ];

        $replace = [
            $class,
            $table,
        ];
        
        return str_replace( $search, $replace, $stub);
    }

}
