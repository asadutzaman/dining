pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\.android.*")
                includeGroupByRegex("com\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "KhaiDai"

/*
 * Modules are split by bounded context rather than by screen: a feature owns a
 * whole user concern and its screens, so navigation between related screens
 * stays internal and only the entry points are public API.
 */
include(":app")

include(":core:common")
include(":core:designsystem")
include(":core:data")

include(":feature:auth")     // phone + OTP sign-in
include(":feature:home")     // today's meals, hall occupancy, notifications
include(":feature:booking")  // weekly grid, single-day picker, my bookings
include(":feature:account")  // dues & payments, profile & preferences
