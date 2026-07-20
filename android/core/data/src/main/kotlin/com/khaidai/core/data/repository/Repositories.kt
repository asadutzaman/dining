package com.khaidai.core.data.repository

import com.khaidai.core.common.Outcome
import com.khaidai.core.data.local.CacheStore
import com.khaidai.core.data.network.*
import com.khaidai.core.data.session.SessionStore
import kotlinx.serialization.KSerializer
import kotlinx.serialization.builtins.ListSerializer
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Fetch from the network; on a *connectivity* failure fall back to the last
 * snapshot so the screen still has something to show.
 *
 * Only [Outcome.Kind.Network] falls back. A rule or auth failure is a real
 * answer from the server and must reach the member -- silently substituting
 * stale data there would hide that their booking did not go through.
 */
private suspend fun <T> cachedFetch(
    cache: CacheStore,
    key: String,
    serializer: KSerializer<T>,
    fetch: suspend () -> Outcome<T>,
): Outcome<T> = when (val result = fetch()) {
    is Outcome.Success -> {
        cache.write(key, serializer, result.data)
        result
    }

    is Outcome.Failure -> if (result.kind == Outcome.Kind.Network) {
        cache.read(key, serializer)
            ?.let { Outcome.Success(it) }
            ?: result
    } else {
        result
    }
}

@Singleton
class AuthRepository @Inject constructor(
    private val api: KhaiDaiApi,
    private val session: SessionStore,
    private val cache: CacheStore,
) {
    val isSignedIn = session.isSignedIn

    suspend fun requestOtp(phone: String): Outcome<OtpRequestedDto> =
        safeApiCall { api.requestOtp(RequestOtpBody(phone)) }

    suspend fun verifyOtp(phone: String, code: String, deviceModel: String?): Outcome<MemberDto> =
        when (
            val result = safeApiCall {
                api.verifyOtp(
                    VerifyOtpBody(phone = phone, code = code, deviceModel = deviceModel),
                )
            }
        ) {
            is Outcome.Success -> {
                val member = result.data.member
                session.signIn(
                    token = result.data.token.accessToken,
                    name = member.name,
                    initials = member.initials,
                    code = member.memberCode,
                    language = member.preferences.language,
                )
                Outcome.Success(member)
            }

            is Outcome.Failure -> result
        }

    /**
     * Local state is cleared regardless of what the server says: if the call
     * fails the member still expects to be signed out on this device.
     */
    suspend fun signOut() {
        runCatching { api.logout() }
        session.signOut()
        cache.clear()
    }
}

@Singleton
class HomeRepository @Inject constructor(
    private val api: KhaiDaiApi,
    private val cache: CacheStore,
) {
    suspend fun home(): Outcome<HomeDto> =
        cachedFetch(cache, KEY, HomeDto.serializer()) { safeApiCall { api.home() } }

    private companion object { const val KEY = "home" }
}

@Singleton
class BookingRepository @Inject constructor(
    private val api: KhaiDaiApi,
    private val cache: CacheStore,
) {
    suspend fun plan(from: String? = null, to: String? = null): Outcome<PlanDto> =
        cachedFetch(cache, "plan:$from:$to", PlanDto.serializer()) {
            safeApiCall { api.plan(from, to) }
        }

    suspend fun usualWeek(from: String, to: String): Outcome<SuggestionDto> =
        safeApiCall { api.usualWeek(from, to) }

    suspend fun upcoming(): Outcome<List<BookingGroupDto>> =
        cachedFetch(cache, "upcoming", ListSerializer(BookingGroupDto.serializer())) {
            safeApiCall { api.upcoming() }
        }

    suspend fun history(): Outcome<List<BookingGroupDto>> =
        cachedFetch(cache, "history", ListSerializer(BookingGroupDto.serializer())) {
            safeApiCall { api.history() }
        }

    suspend fun book(mealDate: String, mealType: String): Outcome<BookingDto> =
        safeApiCall { api.book(BookingBody(mealDate, mealType)) }

    suspend fun cancel(mealDate: String, mealType: String): Outcome<BookingDto> =
        safeApiCall { api.cancel(BookingBody(mealDate, mealType)) }

    suspend fun syncDay(mealDate: String, mealTypes: List<String>): Outcome<SyncOutcomeDto> =
        safeApiCall { api.syncDay(SyncDayBody(mealDate, mealTypes)) }

    suspend fun syncWeek(days: List<SyncDayBody>): Outcome<SyncOutcomeDto> =
        safeApiCall { api.syncWeek(SyncWeekBody(days)) }
}

@Singleton
class DuesRepository @Inject constructor(
    private val api: KhaiDaiApi,
    private val cache: CacheStore,
) {
    suspend fun dues(month: String? = null): Outcome<DuesDto> =
        cachedFetch(cache, "dues:$month", DuesDto.serializer()) { safeApiCall { api.dues(month) } }

    suspend fun charges(month: String? = null): Outcome<List<ChargeDto>> =
        cachedFetch(cache, "charges:$month", ListSerializer(ChargeDto.serializer())) {
            safeApiCall { api.charges(month) }
        }
}

@Singleton
class ProfileRepository @Inject constructor(
    private val api: KhaiDaiApi,
    private val cache: CacheStore,
    private val session: SessionStore,
) {
    suspend fun profile(): Outcome<MemberDto> =
        cachedFetch(cache, "profile", MemberDto.serializer()) { safeApiCall { api.profile() } }

    suspend fun updatePreferences(body: PreferencesBody): Outcome<MemberDto> =
        when (val result = safeApiCall { api.updatePreferences(body) }) {
            is Outcome.Success -> {
                // Mirror the language locally so the app shell can switch before
                // the next profile fetch.
                session.setLanguage(result.data.preferences.language)
                cache.write("profile", MemberDto.serializer(), result.data)
                result
            }

            is Outcome.Failure -> result
        }

    suspend fun reportCard(reason: String, note: String?): Outcome<Unit> =
        safeApiCall { api.reportCard(ReportCardBody(reason, note)) }
}

@Singleton
class NotificationRepository @Inject constructor(
    private val api: KhaiDaiApi,
    private val cache: CacheStore,
) {
    suspend fun feed(): Outcome<NotificationFeedDto> =
        cachedFetch(cache, "notifications", NotificationFeedDto.serializer()) {
            safeApiCall { api.notifications() }
        }

    suspend fun markAllRead(): Outcome<Unit> = safeApiCall { api.markAllRead() }

    suspend fun markRead(id: Long): Outcome<Unit> = safeApiCall { api.markRead(id) }

    suspend fun dismiss(id: Long): Outcome<Unit> = safeApiCall { api.dismiss(id) }
}
