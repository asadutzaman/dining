package com.khaidai.feature.auth

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.khaidai.core.designsystem.component.ErrorBanner
import com.khaidai.core.designsystem.component.PillButton
import com.khaidai.core.designsystem.theme.Blue
import com.khaidai.core.designsystem.theme.Canvas
import com.khaidai.core.designsystem.theme.Ink
import com.khaidai.core.designsystem.theme.InkMuted
import com.khaidai.core.designsystem.theme.InkSoft
import com.khaidai.core.designsystem.theme.Navy

/**
 * Sign-in. Two steps in one destination -- the member's mental model is a single
 * "log in" action, and going back is a step within it, not a navigation event.
 */
@Composable
fun AuthRoute(
    onSignedIn: () -> Unit,
    viewModel: AuthViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    LaunchedEffect(state.signedIn) {
        if (state.signedIn) onSignedIn()
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Canvas)
            .padding(horizontal = 28.dp)
            .padding(top = 96.dp),
    ) {
        Text("KhaiDai", fontSize = 36.sp, fontWeight = FontWeight.ExtraBold, color = Navy)
        Text(
            text = "খাইদাই",
            fontSize = 22.sp,
            fontWeight = FontWeight.SemiBold,
            color = Blue,
            modifier = Modifier.padding(top = 2.dp),
        )
        Text(
            text = "College dining · book your meals ahead",
            fontSize = 13.sp,
            color = InkMuted,
            modifier = Modifier.padding(top = 8.dp),
        )

        Spacer(Modifier.height(44.dp))

        when (state.step) {
            AuthUiState.Step.Phone -> PhoneStep(state, viewModel)
            AuthUiState.Step.Code -> CodeStep(state, viewModel)
        }

        Spacer(Modifier.height(20.dp))
        ErrorBanner(message = state.error, modifier = Modifier.fillMaxWidth())
    }
}

@Composable
private fun PhoneStep(state: AuthUiState, viewModel: AuthViewModel) {
    Text("Your mobile number", fontSize = 15.sp, fontWeight = FontWeight.Bold, color = Ink)
    Text(
        text = "We'll text you a code to sign in.",
        fontSize = 12.5.sp,
        color = InkMuted,
        modifier = Modifier.padding(top = 4.dp),
    )

    Spacer(Modifier.height(16.dp))

    OutlinedTextField(
        value = state.phone,
        onValueChange = viewModel::onPhoneChanged,
        modifier = Modifier.fillMaxWidth(),
        placeholder = { Text("01XXXXXXXXX", color = InkMuted) },
        singleLine = true,
        shape = RoundedCornerShape(16.dp),
        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
        textStyle = TextStyle(fontSize = 18.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.sp),
    )

    Spacer(Modifier.height(20.dp))

    PillButton(
        text = "Send code",
        onClick = viewModel::requestOtp,
        enabled = state.isPhoneValid,
        loading = state.isSubmitting,
        modifier = Modifier.fillMaxWidth(),
    )
}

@Composable
private fun CodeStep(state: AuthUiState, viewModel: AuthViewModel) {
    Text("Enter your code", fontSize = 15.sp, fontWeight = FontWeight.Bold, color = Ink)
    Text(
        text = "Sent to ${state.maskedPhone ?: state.phone}",
        fontSize = 12.5.sp,
        color = InkMuted,
        modifier = Modifier.padding(top = 4.dp),
    )

    Spacer(Modifier.height(16.dp))

    OutlinedTextField(
        value = state.code,
        onValueChange = viewModel::onCodeChanged,
        modifier = Modifier.fillMaxWidth(),
        placeholder = { Text("••••••", color = InkMuted, textAlign = TextAlign.Center) },
        singleLine = true,
        shape = RoundedCornerShape(16.dp),
        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword),
        textStyle = TextStyle(
            fontSize = 26.sp,
            fontWeight = FontWeight.ExtraBold,
            letterSpacing = 12.sp,
            textAlign = TextAlign.Center,
        ),
    )

    Spacer(Modifier.height(20.dp))

    PillButton(
        text = "Verify & sign in",
        onClick = viewModel::verify,
        enabled = state.isCodeValid,
        loading = state.isSubmitting,
        modifier = Modifier.fillMaxWidth(),
    )

    Row(
        modifier = Modifier.fillMaxWidth().padding(top = 6.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        TextButton(onClick = viewModel::backToPhone) {
            Text("Change number", fontSize = 12.5.sp, fontWeight = FontWeight.Bold, color = InkSoft)
        }
        Spacer(Modifier.weight(1f))
        TextButton(
            onClick = viewModel::requestOtp,
            enabled = state.resendIn == 0 && !state.isSubmitting,
        ) {
            Text(
                text = if (state.resendIn > 0) "Resend in ${state.resendIn}s" else "Resend code",
                fontSize = 12.5.sp,
                fontWeight = FontWeight.Bold,
                color = if (state.resendIn > 0) InkMuted else Blue,
            )
        }
    }
}
