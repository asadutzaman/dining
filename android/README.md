# KhaiDai — dining meal pre-booking (Android)

Native Android client for the `KhaiDai Mobile App` design. Members sign in with
their phone number, pre-book meals against per-meal cutoffs, and see what they
owe. Talks to the Laravel API in `../backend` under `/api/mobile/v1`.

## Architecture

```
:app                 navigation shell, bottom bar, DI entry point
:core:common         Outcome / UiState / dispatcher qualifiers
:core:designsystem   palette, type, shared composables (no data dependencies)
:core:data           Retrofit + DTOs, Room snapshot cache, DataStore session, repositories
:feature:auth        phone + OTP sign-in
:feature:home        today's meals, hall occupancy, notifications feed
:feature:booking     weekly grid, single-day picker, my bookings
:feature:account     dues & payments, profile & preferences
```

Modules are split by **bounded context, not by screen**: `:feature:booking` owns
three screens because they are one user concern, and only its route composables
are public.

MVVM with unidirectional data flow. ViewModels expose a single immutable state
object; composables are stateless and take callbacks.

### Decisions worth knowing

**The server composes screens.** Endpoints return view-shaped payloads including
labels, prices and flags like `can_book` / `locked`. The client renders those
decisions rather than re-deriving cutoff rules, so the app and the counter can
never disagree about whether a meal is still bookable.

**The offline cache stores raw responses.** `:core:data/local/Cache.kt` keeps the
JSON per endpoint instead of normalising into relational tables. Normalising
would mean re-implementing the server's composition on the client and keeping
the two in step forever. Snapshots fall back **only** on connectivity failures —
a rule failure ("cutoff passed") must always reach the member.

**Grid edits are staged, not streamed.** The weekly grid keeps pending toggles in
memory and commits the whole week through `PUT /bookings/week`, which sends the
desired end state per day. A stale screen therefore cannot double-book, and
planning a week costs one request rather than twenty-one.

**Light theme only.** The design specifies one light palette; an invented dark
mode would ship unreviewed contrast.

## Build

```bash
export JAVA_HOME="/c/Program Files/Android/Android Studio/jbr"   # JDK 17
./gradlew :app:assembleDebug
```

Toolchain: Gradle 8.7, AGP 8.6.1, Kotlin 2.0.21, compileSdk 34, minSdk 26.
`local.properties` (git-ignored) needs `sdk.dir`.

## Pointing at the API

**One file: `gradle.properties`.**

```properties
khaidai.apiBaseUrl.debug=http://10.0.2.2:8000/api/mobile/v1/
khaidai.apiBaseUrl.release=https://your-domain/api/mobile/v1/
```

Android has no runtime `.env` — the value is compiled into
`BuildConfig.API_BASE_URL` at build time, so **rebuild after changing it**.
`core/data/build.gradle.kts` reads these keys; nothing else needs editing.

| Target | Value |
|---|---|
| Emulator | `http://10.0.2.2:8000/...` (the host's localhost) |
| Physical device | `http://<your-LAN-IP>:8000/...` |
| Production | `https://<your-domain>/...` |

To use a different URL on one machine without editing the committed file, put
the same key in `local.properties` — it is git-ignored and takes precedence.

Two footguns the build guards against or you should know about:

- **The trailing slash is required.** Retrofit silently discards the last path
  segment of a base URL without it, turning every call into a 404. The build
  fails with a clear message if it is missing.
- **Release builds reject plain HTTP.** Cleartext is enabled only by the debug
  manifest overlay (`app/src/debug/AndroidManifest.xml`), so the release URL
  must be `https://`.

For a physical device, Laravel also has to listen beyond localhost:

```bash
php artisan serve --host=0.0.0.0 --port=8000
```

## Signing in during development

Set `SMS_DRIVER=log` in the backend `.env` (the default). Requesting a code
writes it to `storage/logs/laravel.log` instead of sending an SMS:

```
[SMS] to 01712345678: 481920 is your KhaiDai login code...
```

For a fixed code, set `MEMBER_OTP_DEMO_PHONE` and `MEMBER_OTP_DEMO_CODE`. Leave
both unset in production.

The member must already exist in `members` with that phone and `status = 1`.

## Not yet wired

- **Push delivery.** `POST /auth/device` and the `member_devices` table are ready,
  but no FCM SDK is integrated — notifications are in-app only until a Firebase
  project is added.
- **Fonts.** Bricolage Grotesque and Noto Sans Bengali are not bundled; the
  system font carries the design's weights. Drop the TTFs in `res/font/` and set
  a `FontFamily` in `core/designsystem/theme/Theme.kt`.
- **Bengali strings.** Only `app_name` is localised. Screen copy is currently
  server-supplied English with the Bengali subtitles from the design hardcoded;
  a full `values-bn` pass is outstanding.
- **Tests.** The modules are wired for unit tests (JUnit, coroutines-test,
  Turbine) but no suites are written yet. `WeekViewModel`'s pending-edit logic
  and `MealBookingService`'s cutoff rules are the highest-value first targets.
