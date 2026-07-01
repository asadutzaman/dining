# **_HMS_**

## Backend Configuration

1. **Cloning the Repository**

```
git clone remote_repo_url
```

2. **Copy the Example Environment File to .env File**

```
cp .env.example .env
```

3. **Update the .env File with the following Database Configuration**

```
DB_CONNECTION=pgsql_local_server
# DB_HOST=localhost
# DB_PORT=5432
DB_DATABASE=hms_dev
DB_USERNAME=postgres
DB_PASSWORD=root
DB_PREFIX=hms_aq4nlg_
```

4. **Composer Install**

```
composer install
```

5. **Generate Application Key**

```
php artisan key:generate
```

6. **Run Database Migrations & Seed the Database**

```
php artisan migrate
```

7. **Seeding the Database**

```
php artisan db:seed
```

> (when ask for path: press enter)

8. **Start the Development Server**

```
php artisan serve
```

## Frontend Configuration

1. **Install Node Modules**

```
yarn install
```

2. **Copy the config.constant.ts.example to config.constant.ts**

```
cp config.constant.ts.example config.constant.ts
export const BASE_URL = 'http://localhost:3000'
export const API_SERVER_URL = 'http://127.0.0.1:8000/'
export const MEDIA_SOURCE = 'http://127.0.0.1:8000/api/file/'
export const SERVER_PREFIX = "api";
```

3. **Start the Development Server**

```
yarn start
```

### Login Details

```
Email: admin@gmail.com
Password: 123456
```

#

# run db seed json file for permission
php artisan db:seed PermissionsSeeder
hms/patientPermission.json
