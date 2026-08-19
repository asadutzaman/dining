package com.khaidai.core.data.network

import com.khaidai.core.data.session.SessionStore
import kotlinx.coroutines.runBlocking
import okhttp3.Interceptor
import okhttp3.Response
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Attaches the member's bearer token, and treats a 401 as the end of the session.
 *
 * There is no refresh flow to attempt: Sanctum tokens here are long-lived and a
 * rejection means the token was revoked, expired or the membership deactivated.
 * The only correct response is to clear the session so the app returns to sign-in.
 */
@Singleton
class AuthInterceptor @Inject constructor(
    private val session: SessionStore,
) : Interceptor {

    override fun intercept(chain: Interceptor.Chain): Response {
        val original = chain.request()

        // Sign-in endpoints must go out unauthenticated -- sending a stale token
        // to request-otp would get the whole call rejected.
        val isAuthFree = original.url.encodedPath.let {
            it.endsWith("/auth/request-otp") || it.endsWith("/auth/verify-otp")
        }

        val token = if (isAuthFree) null else runBlocking { session.currentToken() }

        val request = original.newBuilder()
            .header("Accept", "application/json")
            .apply { if (!token.isNullOrBlank()) header("Authorization", "Bearer $token") }
            .build()

        val response = chain.proceed(request)

        if (response.code == 401 && !isAuthFree) {
            runBlocking { session.signOut() }
        }

        return response
    }
}
