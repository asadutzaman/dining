---
name: new-module
description: Scaffold a new feature module (backend CRUD + permissions + frontend form/table/dropdowns/menu) following this repo's established pattern. Use whenever the user asks to build/add/create a new module, entity, feature, or page (e.g. "add a Supplier module", "create a new Ledger feature").
---

# New module scaffolding (Laravel + React/Metronic)

This repo has an established, repeatable pattern for building a full feature module (backend + frontend). Always follow it instead of inventing a new structure. Ask the user for the entity name (singular/plural) and its fields before starting if not given.

## 0. Design the database table first (senior-engineer step)

Before running the generator, propose the migration schema explicitly and get it right:
- Correct column types/sizes for each field (not just `string()` by default).
- `nullable()` only where genuinely optional; required fields NOT NULL.
- Foreign keys with an explicit `onDelete` behavior (`cascade`/`restrict`/`set null` as appropriate).
- Indexes on columns used for search/filter/sort and on FK columns.
- Unique constraints where the data model requires them.
- Avoid denormalized/redundant columns unless justified (e.g. reporting).

Present the proposed schema to the user before or right after generating the migration stub, then fill it in.

## 1. Backend

1. Generate scaffolding:
   ```
   php artisan imake:crud {Name} {Names} --all
   ```
   Command source: `backend/app/Console/Commands/Scaffold/CrudGeneratorCommand.php`. Stubs: `backend/app/Console/Commands/Scaffold/stubs/`.
   This creates Controller, Model, Repository, Resource, Validator, Migration:
   - Model extends `BaseModel` (SoftDeletes/Autofill/Uuid traits).
   - Controller uses `RestControllerTrait`, injects Repository + Validator.
   - Repository extends `BaseRepository` (OData filtering via `$fieldSearchable`).
   - Resource extends `BaseResource`.
   - Validator extends `BaseValidator` with per-HTTP-method `rules()`.
2. Fill in the migration columns (per the DB design above) and the model's `$fillable`.
3. Register routes in `backend/routes/web.php`, following the existing `example` group pattern (lines ~61-85):
   ```php
   Route::group(['prefix' => '{module}', 'middleware' => ['restrictIp', 'authVerify']], function () {
       Route::post('/bulk', [...'bulk']);
       Route::get('/dropdown', [...'dropdown']);
       Route::get('/', [...'index']);
       Route::get('/{id}', [...'show']);
       Route::post('/', [...'store']);
       Route::put('/{id}', [...'update']);
       Route::patch('/{id}', [...'updateFields']);
       Route::delete('/{id}', [...'destroy']);
   });
   ```
4. Add a permission JSON at `backend/database/seeders/json/permission/auth/{module}Permission.json`, following the structure of `examplePermission.json` (a `resource` block + `scopes` array with `auth:{module}:{action}` scope names). `PermissionsSeeder.php` auto-scans this directory recursively — no manual registration needed, just run the seeder.

## 2. Frontend

1. Copy `Frontend/src/app/modules/example/` to `Frontend/src/app/modules/{module}/`. Rename:
   - `ExampleRoutes.tsx` → `{Module}Routes.tsx`
   - `components/ExampleUser/Actions/Example.actions.tsx`
   - `components/ExampleUser/Form/ExampleForm.controller.tsx`, `ExampleForm.form.tsx`
   - `components/ExampleUser/List/ExampleList.controller.tsx`, `.filter.tsx`, `.listing.tsx`, `.pagination.tsx`
   - `components/ExampleUser/View/ExampleView.controller.tsx`, `.view.tsx`
   Update form fields and table columns to match the new entity's fields.
2. Add an API file following `Frontend/src/app/api/Setup/Item.api.ts` (a `RESOURCE_ENDPOINT` constant + `list/getById/create/update/bulk/dropdown` methods), then register/export it in `Frontend/src/app/api/index.tsx`.
3. Add a sidebar entry in `Frontend/src/_metronic/layout/components/sidebar/sidebar-menu/LeftSidebar.menu.tsx`:
   ```tsx
   {
     type: 'item',
     title: '{Module}',
     permission: 'auth:{module}:menuAccess',
     link: { to: '/admin/{module}/list', exactMatch: true, externalUrl: false, openInNewTab: false },
     icon: '...',
     subParent: false,
     subChildren: [],
   }
   ```

## 3. Dropdowns for foreign-key fields

For any field that references another entity, add a matching hook + select component instead of a raw input:
1. Copy `Frontend/src/app/hooks/lists/useOrganizationList.tsx` → `use{Entity}List.tsx`. It should call `{Entity}Api.dropdown()` with OData `$select`/`$orderby` params, manage `loading{Entity}List`/`{entity}List` state via `useEffect`, and expose helpers like `set{Entity}FormFieldValue` / `get{Entity}ById`.
2. Copy `Frontend/src/app/components/Dropdown/OrganizationSelect.tsx` → `{Entity}Select.tsx`. It should consume the hook above and wrap an Ant Design `<Select>` (value=`id`, label=`name_en`), with `allowClear`, `showSearch`, `optionFilterProp`, and a loading spinner.

This pattern is used by ~24 existing entity pairs (e.g. `useBranchList`/`BranchSelect`, `useDepartmentList`/`DepartmentSelect`) — match it exactly rather than introducing a different dropdown approach.

## Checklist summary

- [ ] DB schema proposed and reviewed (types, nulls, FKs, indexes, uniques)
- [ ] `php artisan imake:crud` run, migration + model filled in
- [ ] Routes added to `web.php`
- [ ] Permission JSON added under `database/seeders/json/permission/auth/`
- [ ] Frontend module folder copied/renamed from `example`, fields updated
- [ ] API file added + registered in `api/index.tsx`
- [ ] Sidebar menu entry added
- [ ] Dropdown hook + select component added for each FK field
