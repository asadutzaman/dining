package com.khaidai.feature.auth

import android.os.Build
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.khaidai.core.common.Outcome
import com.khaidai.core.data.repository.AuthRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.delay
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class AuthUiState(
    val step: Step = Step.Phone,
    val phone: String = "",
    val code: String = "",
    val maskedPhone: String? = null,
    val isSubmitting: Boolean = false,
    val error: String? = null,
    /** Seconds until "Resend code" becomes tappable again. */
    val resendIn: Int = 0,
    val signedIn: Boolean = false,
) {
    enum class Step { Phone, Code }

    // Mirrors the server's rule (01 + operator digit + 8 more) so the button
    // disables before a doomed round trip.
    val isPhoneValid: Boolean get() = phone.length == 11 && phone.startsWith("01")

    val isCodeValid: Boolean get() = code.length == OTP_LENGTH

    companion object { const val OTP_LENGTH = 6 }
}

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val repository: AuthRepository,
) : ViewModel() {

    private val _state = MutableStateFlow(AuthUiState())
    val state: StateFlow<AuthUiState> = _state.asStateFlow()

    private var resendJob: Job? = null

    fun onPhoneChanged(value: String) {
        // Digits only, capped at a local BD number's length.
        val digits = value.filter(Char::isDigit).take(11)
        _state.update { it.copy(phone = digits, error = null) }
    }

    fun onCodeChanged(value: String) {
        val digits = value.filter(Char::isDigit).take(AuthUiState.OTP_LENGTH)
        _state.update { it.copy(code = digits, error = null) }

        // Submitting on the last digit saves a tap; the member has nothing else
        // to do on this screen.
        if (digits.length == AuthUiState.OTP_LENGTH) verify()
    }

    fun requestOtp() {
        val current = _state.value
        if (!current.isPhoneValid || current.isSubmitting) return

        viewModelScope.launch {
            _state.update { it.copy(isSubmitting = true, error = null) }

            when (val result = repository.requestOtp(current.phone)) {
                is Outcome.Success -> {
                    _state.update {
                        it.copy(
                            step = AuthUiState.Step.Code,
                            maskedPhone = result.data.phone,
                            isSubmitting = false,
                            code = "",
                        )
                    }
                    startResendCountdown(result.data.resendAvailableIn)
                }

                is Outcome.Failure ->
                    _state.update { it.copy(isSubmitting = false, error = result.message) }
            }
        }
    }

    fun verify() {
        val current = _state.value
        if (!current.isCodeValid || current.isSubmitting) return

        viewModelScope.launch {
            _state.update { it.copy(isSubmitting = true, error = null) }

            when (val result = repository.verifyOtp(current.phone, current.code, Build.MODEL)) {
                is Outcome.Success ->
                    _state.update { it.copy(isSubmitting = false, signedIn = true) }

                is Outcome.Failure ->
                    // The code is cleared so the member retypes rather than
                    // editing a rejected value.
                    _state.update { it.copy(isSubmitting = false, error = result.message, code = "") }
            }
        }
    }

    fun backToPhone() {
        resendJob?.cancel()
        _state.update { it.copy(step = AuthUiState.Step.Phone, code = "", error = null, resendIn = 0) }
    }

    private fun startResendCountdown(seconds: Int) {
        resendJob?.cancel()
        resendJob = viewModelScope.launch {
            for (remaining in seconds downTo 0) {
                _state.update { it.copy(resendIn = remaining) }
                delay(1_000)
            }
        }
    }
}
