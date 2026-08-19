package com.khaidai.core.data.network

import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.PATCH
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Path
import retrofit2.http.Query

interface KhaiDaiApi {

    /* ---- auth ---- */

    @POST("auth/request-otp")
    suspend fun requestOtp(@Body body: RequestOtpBody): Response<ApiEnvelope<OtpRequestedDto>>

    @POST("auth/verify-otp")
    suspend fun verifyOtp(@Body body: VerifyOtpBody): Response<ApiEnvelope<SignInDto>>

    @GET("auth/me")
    suspend fun me(): Response<ApiEnvelope<MemberDto>>

    @POST("auth/logout")
    suspend fun logout(): Response<ApiEnvelope<Unit>>

    /* ---- home ---- */

    @GET("home")
    suspend fun home(): Response<ApiEnvelope<HomeDto>>

    /* ---- bookings ---- */

    @GET("bookings/plan")
    suspend fun plan(
        @Query("from") from: String? = null,
        @Query("to") to: String? = null,
    ): Response<ApiEnvelope<PlanDto>>

    @GET("bookings/usual-week")
    suspend fun usualWeek(
        @Query("from") from: String? = null,
        @Query("to") to: String? = null,
    ): Response<ApiEnvelope<SuggestionDto>>

    @GET("bookings/upcoming")
    suspend fun upcoming(): Response<ApiEnvelope<List<BookingGroupDto>>>

    @GET("bookings/history")
    suspend fun history(
        @Query("from") from: String? = null,
        @Query("to") to: String? = null,
    ): Response<ApiEnvelope<List<BookingGroupDto>>>

    @POST("bookings")
    suspend fun book(@Body body: BookingBody): Response<ApiEnvelope<BookingDto>>

    @POST("bookings/cancel")
    suspend fun cancel(@Body body: BookingBody): Response<ApiEnvelope<BookingDto>>

    @PUT("bookings/day")
    suspend fun syncDay(@Body body: SyncDayBody): Response<ApiEnvelope<SyncOutcomeDto>>

    @PUT("bookings/week")
    suspend fun syncWeek(@Body body: SyncWeekBody): Response<ApiEnvelope<SyncOutcomeDto>>

    /* ---- dues ---- */

    @GET("dues")
    suspend fun dues(@Query("month") month: String? = null): Response<ApiEnvelope<DuesDto>>

    @GET("dues/charges")
    suspend fun charges(@Query("month") month: String? = null): Response<ApiEnvelope<List<ChargeDto>>>

    /* ---- profile ---- */

    @GET("profile")
    suspend fun profile(): Response<ApiEnvelope<MemberDto>>

    @PATCH("profile/preferences")
    suspend fun updatePreferences(@Body body: PreferencesBody): Response<ApiEnvelope<MemberDto>>

    @POST("profile/report-card")
    suspend fun reportCard(@Body body: ReportCardBody): Response<ApiEnvelope<Unit>>

    /* ---- notifications ---- */

    @GET("notifications")
    suspend fun notifications(): Response<ApiEnvelope<NotificationFeedDto>>

    @POST("notifications/read-all")
    suspend fun markAllRead(): Response<ApiEnvelope<Unit>>

    @POST("notifications/{id}/read")
    suspend fun markRead(@Path("id") id: Long): Response<ApiEnvelope<Unit>>

    @POST("notifications/{id}/dismiss")
    suspend fun dismiss(@Path("id") id: Long): Response<ApiEnvelope<Unit>>
}
