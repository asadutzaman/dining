package com.khaidai.core.data.network

import com.khaidai.core.common.Outcome
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import retrofit2.Response
import java.io.IOException

/**
 * The single place an HTTP response becomes an [Outcome].
 *
 * Because the server answers business failures with a member-readable message in
 * the envelope, that message is passed straight through. Only transport-level
 * problems get a message written here.
 */
suspend fun <T> safeApiCall(
    call: suspend () -> Response<ApiEnvelope<T>>,
): Outcome<T> = try {
    val response = call()
    val envelope = response.body()

    when {
        response.isSuccessful && envelope?.success == true && envelope.data != null ->
            Outcome.Success(envelope.data)

        // A 200 with success=true but no payload: endpoints like logout and
        // mark-read answer this way. Only valid where T is Unit.
        response.isSuccessful && envelope?.success == true ->
            @Suppress("UNCHECKED_CAST")
            Outcome.Success(Unit as T)

        response.code() == 401 -> Outcome.Failure(
            message = envelope?.message ?: "Your session has expired. Please sign in again.",
            kind = Outcome.Kind.Unauthorized,
        )

        response.code() == 422 -> Outcome.Failure(
            message = envelope?.message ?: "Please check what you entered.",
            kind = if (envelope?.errors != null) Outcome.Kind.Validation else Outcome.Kind.Rule,
            fieldErrors = parseFieldErrors(envelope),
        )

        response.code() == 429 -> Outcome.Failure(
            message = envelope?.message ?: "Too many attempts. Please wait a moment.",
            kind = Outcome.Kind.Rule,
        )

        response.code() in 500..599 -> Outcome.Failure(
            message = "The dining server is having trouble. Please try again shortly.",
            kind = Outcome.Kind.Unknown,
        )

        else -> Outcome.Failure(
            message = envelope?.message ?: errorMessageFrom(response) ?: "Something went wrong.",
            kind = Outcome.Kind.Unknown,
        )
    }
} catch (e: IOException) {
    // No route to the server: the caller may still have cached data worth showing.
    Outcome.Failure(
        message = "You're offline. Showing the last information we have.",
        kind = Outcome.Kind.Network,
        cause = e,
    )
} catch (e: Exception) {
    Outcome.Failure(
        message = "Something went wrong. Please try again.",
        kind = Outcome.Kind.Unknown,
        cause = e,
    )
}

/** Laravel returns `errors` as `{ "field": ["message", ...] }`. */
private fun parseFieldErrors(envelope: ApiEnvelope<*>?): Map<String, List<String>> {
    val errors = envelope?.errors ?: return emptyMap()

    return runCatching {
        errors.jsonObject.mapValues { (_, value) ->
            value.jsonArray.map { it.jsonPrimitive.content }
        }
    }.getOrDefault(emptyMap())
}

/**
 * An error body that never got decoded -- for instance an HTML error page from a
 * proxy sitting in front of the API.
 */
private fun <T> errorMessageFrom(response: Response<T>): String? = runCatching {
    val raw = response.errorBody()?.string().orEmpty()
    if (raw.isBlank()) return null

    Json { ignoreUnknownKeys = true }
        .parseToJsonElement(raw)
        .jsonObject["message"]
        ?.jsonPrimitive
        ?.content
}.getOrNull()
