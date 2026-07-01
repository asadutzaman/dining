<?php

namespace App\Console\Commands\Scaffold;

use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class CrudGeneratorCommand extends Command
{
    protected $basePath;

    protected $singularName;

    protected $pluralName;

    protected $signature = 'imake:crud
                              {singularName     : Singular name}
                              {pluralName?      : Plural name}

                              {--all            : Bulk Create (model, migration, factory, controller, repository, validator, resource)}
                              {--all-model      : Bulk Create (migration, model, seeder, factory)}
                              {--all-controller : Bulk Create (repository, controller, validator, resource)}

                              {--migration      : Create a new migration file}
                              {--model          : Create a new Eloquent model class}
                              {--seeder         : Create a new seeder file}
                              {--factory        : Create a new model factory}

                              {--repository     : Create a new repository class}
                              {--controller     : Create a new controller class}
                              {--validator      : Create a new form validator class}
                              {--resource       : Create a new resource}

                              {--resource-collection : Create a new resource}
                              {--interface      : Create a new interface class}
                              {--service        : Create a new service class}
                              {--provider       : Create a new provider class}
                              {--helper         : Create a new helper class}
                              {--trait          : Create a new trait class}
                              {--test           : Create a new test class}
    ';

    protected $description = 'Create CRUD operations';

    private function setProperties() {
        $this->basePath =  'App\Components';

        $this->singularName = trim($this->argument('singularName'));

        if (empty($this->argument('pluralName'))) {
            $this->pluralName = Str::plural($this->argument('pluralName'));
        }
        else {
            $this->pluralName = trim($this->argument('pluralName'));
        }
    }

    public function handle()
    {
        $this->setProperties();

        if ($this->option('all')) {
            $this->input->setOption('migration', true);
            $this->input->setOption('model', true);
            $this->input->setOption('repository', true);
            $this->input->setOption('controller', true);
            $this->input->setOption('resource', true);
            $this->input->setOption('validator', true);
        }
        if ($this->option('all-model')) {
            $this->input->setOption('migration', true);
            $this->input->setOption('model', true);
            $this->input->setOption('repository', true);
        }
        if ($this->option('all-controller')) {
            $this->input->setOption('repository', true);
            $this->input->setOption('controller', true);
            $this->input->setOption('validator', true);
            $this->input->setOption('resource', true);
        }
        if ($this->option('migration')) {
            $this->createMigration();
        }
        if($this->option('model')) {
            $this->createModel();
        }
        if($this->option('seeder')) {
            $this->createSeeder();
        }
        if ($this->option('factory')) {
            $this->createFactory();
        }
        if ($this->option('controller')) {
            $this->createController();
        }
        if ($this->option('repository')) {
            $this->createRepository();
        }
        if ($this->option('validator')) {
            $this->createValidator();
        }
        if ($this->option('resource')) {
            $this->createResource();
        }
        if ($this->option('resource-collection')) {
            $this->createResourceCollection();
        }
        if ($this->option('interface')) {
            $this->createInterface();
        }
        if ($this->option('service')) {
            $this->createService();
        }
        if ($this->option('provider')) {
            $this->createProvider();
        }
        if ($this->option('helper')) {
            $this->createHelper();
        }
        if ($this->option('trait')) {
            $this->createTrait();
        }
        if ($this->option('test')) {
            $this->createTest();
        }
    }

    protected function createMigration() : void
    {
        try {
            $strLowerName = Str::lower($this->pluralName);
            $this->call('imake:migration', [
                'name' => $strLowerName,
            ]);
        } catch (\Exception $e) {
            $this->error($e->getMessage());
        }
    }

    protected function createModel() : void
    {
        try {
            $this->call('imake:model', [
                'name' => $this->singularName,
            ]);
        } catch (\Exception $e) {
            $this->error($e->getMessage());
        }
    }

    protected function createSeeder() : void
    {
        try {
            $this->call('imake:seeder', [
                'name' => $this->pluralName,
                '--model' => $this->singularName,
            ]);
        } catch (\Exception $e) {
            $this->error($e->getMessage());
        }
    }

    protected function createFactory() : void
    {
        try {
            $this->call('imake:factory', [
                'name' => $this->singularName . 'Factory',
                '--model' => $this->singularName,
            ]);
        } catch (\Exception $e) {
            $this->error($e->getMessage());
        }
    }

    protected function createRepository() : void
    {
        try {
            $this->call('imake:repository', [
                'name' => $this->singularName . 'Repository' ,
                '--model' => $this->singularName,
            ]);
        } catch (\Exception $e) {
            $this->error($e->getMessage());
        }
    }

    protected function createController() : void
    {
        try {
            $this->call('imake:controller', [
                'name' => $this->singularName . 'Controller',
                '--model' => $this->singularName,
            ]);
        } catch (\Exception $e) {
            $this->error($e->getMessage());
        }
    }

    protected function createValidator() : void
    {
        try {
            $this->call('imake:validator', [
                'name' => $this->singularName . 'Validator',
            ]);
        } catch (\Exception $e) {
            $this->error($e->getMessage());
        }
    }

    protected function createResource() : void
    {
        try {
            $this->call('imake:resource', [
                'name' => $this->singularName . 'Resource',
            ]);
        } catch (\Exception $e) {
            $this->error($e->getMessage());
        }
    }

    protected function createResourceCollection() : void
    {
        try {
            $this->call('imake:resource', [
                'name' => $this->singularName . 'Collection',
                '--collection' => $this->singularName,
            ]);
        } catch (\Exception $e) {
            $this->error($e->getMessage());
        }
    }

    protected function createInterface() : void
    {
        try {
            $this->call('imake:interface', [
                'name' => $this->singularName . 'Interface',
            ]);
        } catch (\Exception $e) {
            $this->error($e->getMessage());
        }
    }

    protected function createService() : void
    {
        try {
            $this->call('imake:service', [
                'name' => $this->singularName . 'Service',
            ]);
        } catch (\Exception $e) {
            $this->error($e->getMessage());
        }
    }

    protected function createProvider() : void
    {
        try {
            $this->call('imake:provider', [
                'name' => $this->singularName . 'Provider',
            ]);
        } catch (\Exception $e) {
            $this->error($e->getMessage());
        }
    }

    protected function createHelper() : void
    {
        try {
            $this->call('imake:helper', [
                'name' => $this->singularName . 'Helper',
            ]);
        } catch (\Exception $e) {
            $this->error($e->getMessage());
        }
    }

    protected function createTrait() : void
    {
        try {
            $this->call('imake:trait', [
                'name' => $this->singularName . 'Trait',
            ]);
        } catch (\Exception $e) {
            $this->error($e->getMessage());
        }
    }

    protected function createTest() : void
    {
        try {
            $this->call('imake:test', [
                'name' => $this->singularName . 'Test',
                '--unit' => true,
            ]);
        } catch (\Exception $e) {
            $this->error($e->getMessage());
        }
    }
}
