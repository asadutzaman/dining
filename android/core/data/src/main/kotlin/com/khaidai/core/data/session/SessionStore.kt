package com.khaidai.core.data.session

import android.content.Context
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

private val Context.dataStore by preferencesDataStore(name = "khaidai_session")

/**
 * Holds the access token and the few identity bits the UI needs before its first
 * network call (name and initials for the home header, language for the shell).
 *
 * Note this is DataStore, not EncryptedSharedPreferences: the token is a
 * revocable bearer credential scoped to one device, and app-private storage is
 * the same protection the platform gives every other app's session. If the
 * threat model ever includes rooted devices, this class is the one seam that
 * would change.
 */
@Singleton
class SessionStore @Inject constructor(
    @ApplicationContext private val context: Context,
) {
    private object Keys {
        val TOKEN = stringPreferencesKey("access_token")
        val MEMBER_NAME = stringPreferencesKey("member_name")
        val MEMBER_INITIALS = stringPreferencesKey("member_initials")
        val MEMBER_CODE = stringPreferencesKey("member_code")
        val LANGUAGE = stringPreferencesKey("language")
        val ONBOARDED = booleanPreferencesKey("onboarded")
    }

    val token: Flow<String?> = context.dataStore.data.map { it[Keys.TOKEN] }

    val isSignedIn: Flow<Boolean> = context.dataStore.data.map { !it[Keys.TOKEN].isNullOrBlank() }

    val language: Flow<String> = context.dataStore.data.map { it[Keys.LANGUAGE] ?: "en" }

    val memberName: Flow<String?> = context.dataStore.data.map { it[Keys.MEMBER_NAME] }

    /**
     * Read synchronously for the OkHttp interceptor, which is not a coroutine
     * context we control. Backed by DataStore's in-memory cache after the first
     * read, so this is not a disk hit per request.
     */
    suspend fun currentToken(): String? = context.dataStore.data.first()[Keys.TOKEN]

    suspend fun signIn(token: String, name: String, initials: String, code: String, language: String) {
        context.dataStore.edit {
            it[Keys.TOKEN] = token
            it[Keys.MEMBER_NAME] = name
            it[Keys.MEMBER_INITIALS] = initials
            it[Keys.MEMBER_CODE] = code
            it[Keys.LANGUAGE] = language
            it[Keys.ONBOARDED] = true
        }
    }

    suspend fun setLanguage(language: String) {
        context.dataStore.edit { it[Keys.LANGUAGE] = language }
    }

    /**
     * Drops the token and every cached identity field. Called both on explicit
     * sign-out and whenever the API answers 401, so a revoked token cannot leave
     * a half-signed-in shell behind.
     */
    suspend fun signOut() {
        context.dataStore.edit {
            it.remove(Keys.TOKEN)
            it.remove(Keys.MEMBER_NAME)
            it.remove(Keys.MEMBER_INITIALS)
            it.remove(Keys.MEMBER_CODE)
        }
    }
}
