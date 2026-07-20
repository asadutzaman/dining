package com.khaidai.core.common

/**
 * What every screen renders.
 *
 * [content] and [error] deliberately coexist: an offline-first screen shows the
 * last known data with a failure banner over it, which a sealed Loading/Error/
 * Content hierarchy cannot express without losing the cached content.
 */
data class UiState<T>(
    val content: T? = null,
    val isLoading: Boolean = false,
    val isRefreshing: Boolean = false,
    val error: String? = null,
) {
    val isEmpty: Boolean get() = content == null

    /** First load: nothing to show yet, so the screen owes the member a skeleton. */
    val isInitialLoading: Boolean get() = isLoading && isEmpty

    fun loading(refreshing: Boolean = false) = copy(
        isLoading = !refreshing,
        isRefreshing = refreshing,
        error = null,
    )

    fun success(data: T) = copy(
        content = data,
        isLoading = false,
        isRefreshing = false,
        error = null,
    )

    fun failure(message: String) = copy(
        isLoading = false,
        isRefreshing = false,
        error = message,
    )

    fun clearError() = copy(error = null)
}
