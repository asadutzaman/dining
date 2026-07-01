<?php

namespace Database\Seeders;

use Database\Seeders\Traits\DisableForeignKeys;
use Database\Seeders\Traits\TruncateTable;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Artisan;

/**
 * Class AuthTableSeeder.
 */
class AuthSeeder extends Seeder
{
    use DisableForeignKeys, TruncateTable;

    /**
     * Run the database seeds.
     */
    public function run()
    {
        $this->disableForeignKeys();

        // Reset cached roles and permissions
        Artisan::call('cache:clear');

        $this->truncateMultiple([
            'organizations',
            'workspaces',
            'application_settings',
            // Users
            'roles',
            'users',
            // Oauth
            'oauth_auth_clients',
            // Permission
            'resources',
            'scopes',
            'permissions',
        ]);

        $this->call(OrganizationsTableSeeder::class);
        $this->call(WorkspacesTableSeeder::class);
        // $this->call(CountrySeeder::class);
        $this->call(ApplicationSettingsSeeder::class);
        $this->call(UsersSeeder::class);
        $this->call(OauthAuthClientsTableSeeder::class);
        $this->call(PermissionsSeeder::class);
        $this->call(CodeSequenceSeeder::class);
        $this->call(WorkflowSeeder::class);

        $this->enableForeignKeys();
    }
}
