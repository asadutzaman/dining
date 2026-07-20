package com.khaidai.core.data.network

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonElement

/**
 * Mirrors BaseMobileController's envelope. Every endpoint answers in this shape,
 * success or failure, which is what lets [safeApiCall] classify a response once
 * instead of at each call site.
 */
@Serializable
data class ApiEnvelope<T>(
    val success: Boolean = false,
    val message: String? = null,
    val data: T? = null,
    val errors: JsonElement? = null,
)

@Serializable
data class TokenDto(
    @SerialName("access_token") val accessToken: String,
    @SerialName("token_type") val tokenType: String = "Bearer",
    @SerialName("expires_at") val expiresAt: String? = null,
)

@Serializable
data class OtpRequestedDto(
    val phone: String? = null,
    @SerialName("expires_in") val expiresIn: Int = 300,
    @SerialName("resend_available_in") val resendAvailableIn: Int = 60,
)

@Serializable
data class SignInDto(
    val token: TokenDto,
    val member: MemberDto,
)
