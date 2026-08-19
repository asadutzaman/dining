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
        Commands\ClearLogFile::class,
        Commands\Dining\SyncNcmsRoster::class,
        Commands\Dining\SettleMissedBookingsCommand::class,
        Commands\Dining\SendBookingNudgesCommand::class,
    ];

    /**
     * Define the application's command schedule.
     *
     * @param  \Illuminate\Console\Scheduling\Schedule  $schedule
     * @return void
     */
    protected function schedule(Schedule $schedule)
    {
        // Refresh the NCMS roster overnight, well clear of meal service.
        $schedule->command('dining:sync-roster')
            ->dailyAt('02:00')
            ->withoutOverlapping();

        /*
         * Charge no-shows after the last serving window has closed. At 23:30 every
         * meal of the day is unambiguously over, so nothing in service is charged.
         */
        $schedule->command('dining:settle-missed-bookings')
            ->dailyAt('23:30')
            ->withoutOverlapping();

        /*
         * Cutoff warnings. Checked every 15 minutes against a 45-minute lead, so a
         * given cutoff falls inside the window for exactly a few runs; the members'
         * own preference gates delivery.
         */
        $schedule->command('dining:send-booking-nudges --type=cutoff')
            ->everyFifteenMinutes()
            ->between('06:00', '22:00')
            ->withoutOverlapping();

        // "Tomorrow is empty" nudge, at the 8:00 PM the profile screen advertises.
        $schedule->command('dining:send-booking-nudges --type=reminder')
            ->dailyAt('20:00')
            ->withoutOverlapping();
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
