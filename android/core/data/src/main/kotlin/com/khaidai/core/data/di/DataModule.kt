package com.khaidai.core.data.di

import android.content.Context
import androidx.room.Room
import com.jakewharton.retrofit2.converter.kotlinx.serialization.asConverterFactory
import com.khaidai.core.common.IoDispatcher
import com.khaidai.core.data.BuildConfig
import com.khaidai.core.data.local.KhaiDaiDatabase
import com.khaidai.core.data.local.ResponseCacheDao
import com.khaidai.core.data.network.AuthInterceptor
import com.khaidai.core.data.network.KhaiDaiApi
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.Dispatchers
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import java.util.concurrent.TimeUnit
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DataModule {

    @Provides
    @Singleton
    fun json(): Json = Json {
        // The server may add fields ahead of a client release; an unknown key
        // must never break an existing screen.
        ignoreUnknownKeys = true
        explicitNulls = false
        coerceInputValues = true
    }

    @Provides
    @Singleton
    fun okHttp(authInterceptor: AuthInterceptor): OkHttpClient = OkHttpClient.Builder()
        .addInterceptor(authInterceptor)
        .apply {
            if (BuildConfig.DEBUG) {
                // Bodies only in debug: request bodies carry OTP codes and
                // responses carry the bearer token.
                addInterceptor(
                    HttpLoggingInterceptor().apply { level = HttpLoggingInterceptor.Level.BODY },
                )
            }
        }
        .connectTimeout(20, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .build()

    @Provides
    @Singleton
    fun retrofit(client: OkHttpClient, json: Json): Retrofit = Retrofit.Builder()
        .baseUrl(BuildConfig.API_BASE_URL)
        .client(client)
        .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))
        .build()

    @Provides
    @Singleton
    fun api(retrofit: Retrofit): KhaiDaiApi = retrofit.create(KhaiDaiApi::class.java)

    @Provides
    @Singleton
    fun database(@ApplicationContext context: Context): KhaiDaiDatabase =
        Room.databaseBuilder(context, KhaiDaiDatabase::class.java, "khaidai.db")
            // The cache is disposable by definition, so a schema change should
            // drop it rather than ship a migration.
            .fallbackToDestructiveMigration()
            .build()

    @Provides
    @Singleton
    fun responseCacheDao(database: KhaiDaiDatabase): ResponseCacheDao = database.responseCacheDao()

    @Provides
    @Singleton
    @IoDispatcher
    fun ioDispatcher(): CoroutineDispatcher = Dispatchers.IO
}
