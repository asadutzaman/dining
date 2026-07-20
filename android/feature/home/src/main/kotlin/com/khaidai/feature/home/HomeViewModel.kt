package com.khaidai.feature.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.khaidai.core.common.Outcome
import com.khaidai.core.common.UiState
import com.khaidai.core.data.network.HomeDto
import com.khaidai.core.data.repository.BookingRepository
import com.khaidai.core.data.repository.HomeRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class HomeViewModel @Inject constructor(
    private val homeRepository: HomeRepository,
    private val bookingRepository: BookingRepository,
) : ViewModel() {

    private val _state = MutableStateFlow(UiState<HomeDto>())
    val state: StateFlow<UiState<HomeDto>> = _state.asStateFlow()

    init { load() }

    fun load(refreshing: Boolean = false) {
        viewModelScope.launch {
            _state.update { it.loading(refreshing) }

            when (val result = homeRepository.home()) {
                is Outcome.Success -> _state.update { it.success(result.data) }
                is Outcome.Failure -> _state.update { it.failure(result.message) }
            }
        }
    }

    /**
     * Booking straight from the home screen's "Book · ৳65" button. The whole
     * screen is reloaded afterwards rather than patched locally: booking changes
     * the due balance and the now-serving banner too, and the server is the only
     * thing that knows the new truth.
     */
    fun book(mealDate: String, mealType: String) {
        viewModelScope.launch {
            _state.update { it.copy(isRefreshing = true, error = null) }

            when (val result = bookingRepository.book(mealDate, mealType)) {
                is Outcome.Success -> load(refreshing = true)
                is Outcome.Failure -> _state.update { it.failure(result.message) }
            }
        }
    }

    fun dismissError() = _state.update { it.clearError() }
}
