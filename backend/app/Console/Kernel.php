<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * The Artisan commands provided by your application.
     *
     * @var array
     */
    protected $commands = [
        Commands\Scaffold\CrudGeneratorCommand::class,
        Commands\Scaffold\MigrationMakeCommand::class,
        Commands\Scaffold\ModelMakeCommand::class,
        Commands\Scaffold\SeederMakeCommand::class,
        Commands\Scaffold\FactoryMakeCommand::class,
        Commands\Scaffold\ControllerMakeCommand::class,
        Commands\Scaffold\RepositoryMakeCommand::class,
        Commands\Scaffold\ResourceMakeCommand::class,
        Commands\Scaffold\ValidatorMakeCommand::class,
        Commands\Scaffold\InterfaceMakeCommand::class,
        Commands\Scaffold\ServiceMakeCommand::class,
        Commands\Scaffold\ProviderMakeCommand::class,
        Commands\Scaffold\HelperMakeCommand::class,
        Commands\Scaffold\TraitMakeCommand::class,
        Commands\Scaffold\TestMakeCommand::class,
        Commands\ClearLogFile::class
    ];

    /**
     * Define the application's command schedule.
     *
     * @param  \Illuminate\Console\Scheduling\Schedule  $schedule
     * @return void
     */
    protected function schedule(Schedule $schedule)
    {
        // $schedule->command('inspire')->hourly();
    }

    /**
     * Register the commands for the application.
     *
     * @return void
     */
    protected function commands()
    {
        $this->load(__DIR__ . '/Commands');

        require base_path('routes/console.php');
    }
}
