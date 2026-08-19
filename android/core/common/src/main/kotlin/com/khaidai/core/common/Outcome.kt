package com.khaidai.core.common

/**
 * The result of anything that talks to the network or the database.
 *
 * The API returns a uniform envelope in which a business failure ("cutoff
 * passed") arrives with a message meant for the member. Modelling that as a
 * value rather than an exception keeps those messages on the happy path: a
 * screen renders [Failure.message] directly instead of mapping exception types.
 */
sealed interface Outcome<out T> {

    data class Success<T>(val data: T) : Outcome<T>

    /**
     * @param message shown to the member as-is; the server writes it for them
     * @param kind    decides whether the UI retries, re-authenticates or just reports
     */
    data class Failure(
        val message: String,
        val kind: Kind = Kind.Unknown,
        val fieldErrors: Map<String, List<String>> = emptyMap(),
        val cause: Throwable? = null,
    ) : Outcome<Nothing>

    enum class Kind {
        /** No usable connection. Cached data, if any, is still worth showing. */
        Network,

        /** Token missing, expired or rejected -- the session must be rebuilt. */
        Unauthorized,

        /** A rule was broken: cutoff passed, code expired, already settled. */
        Rule,

        /** Input the server rejected; see [Failure.fieldErrors]. */
        Validation,

        /** 5xx or anything we could not classify. */
        Unknown,
    }
}

inline fun <T, R> Outcome<T>.map(transform: (T) -> R): Outcome<R> = when (this) {
    is Outcome.Success -> Outcome.Success(transform(data))
    is Outcome.Failure -> this
}

inline fun <T> Outcome<T>.onSuccess(action: (T) -> Unit): Outcome<T> = apply {
    if (this is Outcome.Success) action(data)
}

inline fun <T> Outcome<T>.onFailure(action: (Outcome.Failure) -> Unit): Outcome<T> = apply {
    if (this is Outcome.Failure) action(this)
}

fun <T> Outcome<T>.dataOrNull(): T? = (this as? Outcome.Success)?.data
