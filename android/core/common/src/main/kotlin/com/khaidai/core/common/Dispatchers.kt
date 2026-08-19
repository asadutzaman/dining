package com.khaidai.core.common

import javax.inject.Qualifier

/**
 * Dispatchers are injected rather than referenced statically so tests can swap
 * in a deterministic scheduler.
 */
@Qualifier
@Retention(AnnotationRetention.RUNTIME)
annotation class IoDispatcher

@Qualifier
@Retention(AnnotationRetention.RUNTIME)
annotation class DefaultDispatcher
