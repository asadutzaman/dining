import java.util.Properties

plugins {
    alias(libs.plugins.android.library)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.serialization)
    alias(libs.plugins.ksp)
    alias(libs.plugins.hilt)
}

/**
 * Resolves the API root for a build type from `gradle.properties`, letting the
 * git-ignored `local.properties` override it per machine.
 *
 * Android has no runtime .env: the value is compiled into BuildConfig, so this
 * is where a URL change has to happen. Keeping it in a properties file rather
 * than inline below means there is exactly one place to edit.
 */
fun apiBaseUrl(buildType: String): String {
    val key = "khaidai.apiBaseUrl.$buildType"

    val local = Properties().apply {
        rootProject.file("local.properties")
            .takeIf { it.exists() }
            ?.inputStream()
            ?.use { load(it) }
    }

    val url = local.getProperty(key)
        ?: providers.gradleProperty(key).orNull
        ?: error("Missing '$key'. Set it in gradle.properties (or local.properties).")

    // Retrofit resolves endpoints relative to the base URL and silently discards
    // the final segment when there is no trailing slash, which turns every call
    // into a 404 at runtime. Cheaper to fail the build.
    require(url.endsWith("/")) {
        "'$key' must end with a trailing slash, got: $url"
    }

    return url
}

android {
    namespace = "com.khaidai.core.data"
    compileSdk = 34

    defaultConfig {
        minSdk = 26

        // Configured in gradle.properties -- see apiBaseUrl() above.
        buildConfigField("String", "API_BASE_URL", "\"${apiBaseUrl("debug")}\"")
    }

    buildTypes {
        release {
            buildConfigField("String", "API_BASE_URL", "\"${apiBaseUrl("release")}\"")
        }
    }

    buildFeatures { buildConfig = true }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions { jvmTarget = "17" }
}

dependencies {
    api(project(":core:common"))

    implementation(libs.androidx.core.ktx)

    implementation(libs.retrofit)
    implementation(libs.retrofit.serialization)
    implementation(libs.okhttp)
    implementation(libs.okhttp.logging)
    api(libs.kotlinx.serialization.json)

    implementation(libs.room.runtime)
    implementation(libs.room.ktx)
    ksp(libs.room.compiler)

    implementation(libs.datastore.preferences)

    implementation(libs.hilt.android)
    ksp(libs.hilt.compiler)

    testImplementation(libs.junit)
    testImplementation(libs.kotlinx.coroutines.test)
}
