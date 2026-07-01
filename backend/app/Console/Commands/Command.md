# Generate All (--controller, --model, --repository, --resource, --validator, --migration)
php artisan imake:crud Sample Samples --all

# Generate (--model, --repository, --validator, --migration)
php artisan imake:crud Sample Samples --all-model

# Single Class Command

php artisan imake:crud Sample Samples --migration
php artisan imake:crud Sample Samples --model
php artisan imake:crud Sample Samples --seeder
php artisan imake:crud Sample Samples --factory

php artisan imake:crud Sample Samples --repository
php artisan imake:crud Sample Samples --controller
php artisan imake:crud Sample Samples --request
php artisan imake:crud Sample Samples --resource
php artisan imake:crud Sample Samples --resource-collection

php artisan imake:crud Sample Samples --interface
php artisan imake:crud Sample Samples --service
php artisan imake:crud Sample Samples --provider
php artisan imake:crud Sample Samples --helper
php artisan imake:crud Sample Samples --trait
php artisan imake:crud Sample Samples --test



