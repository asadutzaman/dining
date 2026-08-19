package com.khaidai.feature.account

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewModelScope
import com.khaidai.core.common.Outcome
import com.khaidai.core.data.network.MemberDto
import com.khaidai.core.data.network.PreferencesBody
import com.khaidai.core.data.repository.AuthRepository
import com.khaidai.core.data.repository.ProfileRepository
import com.khaidai.core.designsystem.component.*
import com.khaidai.core.designsystem.theme.*
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class ProfileUiState(
    val member: MemberDto? = null,
    val isLoading: Boolean = false,
    val error: String? = null,
    val message: String? = null,
    val signedOut: Boolean = false,
)

@HiltViewModel
class ProfileViewModel @Inject constructor(
    private val profileRepository: ProfileRepository,
    private val authRepository: AuthRepository,
) : ViewModel() {

    private val _state = MutableStateFlow(ProfileUiState())
    val state: StateFlow<ProfileUiState> = _state.asStateFlow()

    init { load() }

    fun load() {
        viewModelScope.launch {
            _state.update { it.copy(isLoading = true, error = null) }
            when (val result = profileRepository.profile()) {
                is Outcome.Success -> _state.update { it.copy(member = result.data, isLoading = false) }
                is Outcome.Failure -> _state.update { it.copy(isLoading = false, error = result.message) }
            }
        }
    }

    /**
     * Toggles apply optimistically -- a switch that waits for a round trip feels
     * broken -- and revert to the server's answer if the call fails.
     */
    fun updatePreference(body: PreferencesBody, optimistic: (MemberDto) -> MemberDto) {
        val previous = _state.value.member ?: return
        _state.update { it.copy(member = optimistic(previous)) }

        viewModelScope.launch {
            when (val result = profileRepository.updatePreferences(body)) {
                is Outcome.Success -> _state.update { it.copy(member = result.data) }
                is Outcome.Failure ->
                    _state.update { it.copy(member = previous, error = result.message) }
            }
        }
    }

    fun reportCard(reason: String) {
        viewModelScope.launch {
            when (val result = profileRepository.reportCard(reason, null)) {
                is Outcome.Success -> _state.update {
                    it.copy(message = "Report received. Visit the dining office for a replacement.")
                }
                is Outcome.Failure -> _state.update { it.copy(error = result.message) }
            }
        }
    }

    fun signOut() {
        viewModelScope.launch {
            authRepository.signOut()
            _state.update { it.copy(signedOut = true) }
        }
    }

    fun dismissMessages() = _state.update { it.copy(error = null, message = null) }
}

/** Screen 1f. */
@Composable
fun ProfileRoute(
    onSignedOut: () -> Unit,
    viewModel: ProfileViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    androidx.compose.runtime.LaunchedEffect(state.signedOut) {
        if (state.signedOut) onSignedOut()
    }

    var confirming by remember { mutableStateOf<Confirmation?>(null) }

    Column(
        Modifier
            .fillMaxSize()
            .background(Canvas)
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 24.dp),
    ) {
        // Outside the `when` so the screen keeps its identity while loading.
        // Every other screen shows its title immediately; this one used to
        // render a bare spinner on an otherwise blank page.
        ScreenHeader(title = "Profile", subtitle = "প্রোফাইল ও সেটিংস")
        Spacer(Modifier.height(18.dp))

        when {
            state.isLoading && state.member == null -> LoadingIndicator()
            state.member == null -> CenteredMessage(state.error ?: "Couldn't load your profile.")
            else -> {
                val member = state.member!!

                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier.size(72.dp).clip(CircleShape).background(Blue),
                        contentAlignment = Alignment.Center,
                    ) {
                        Text(
                            text = member.initials,
                            color = Color.White,
                            fontSize = 24.sp,
                            fontWeight = FontWeight.ExtraBold,
                        )
                    }
                    Column(Modifier.padding(start = 16.dp)) {
                        Text(member.name, style = MaterialTheme.typography.titleLarge, color = Ink)
                        Row(
                            modifier = Modifier.padding(top = 5.dp),
                            horizontalArrangement = Arrangement.spacedBy(6.dp),
                        ) {
                            StatusChip(member.memberCode, Ink, Canvas)
                            StatusChip(
                                member.memberType.lowercase().replaceFirstChar(Char::uppercase),
                                BlueTint,
                                Blue,
                            )
                        }
                    }
                }

                Spacer(Modifier.height(18.dp))
                CardPanel(member)

                if (state.error != null || state.message != null) {
                    Spacer(Modifier.height(14.dp))
                    ErrorBanner(state.error ?: state.message, onDismiss = viewModel::dismissMessages)
                }

                Spacer(Modifier.height(20.dp))
                SectionHeader("Notifications")
                Spacer(Modifier.height(8.dp))

                KhaiCard(Modifier.fillMaxWidth(), contentPadding = PaddingValues(0.dp)) {
                    Column {
                        PreferenceRow(
                            label = "Booking reminder",
                            description = "8:00 PM nightly, if tomorrow is empty",
                            checked = member.preferences.bookingReminder,
                        ) { value ->
                            viewModel.updatePreference(PreferencesBody(bookingReminder = value)) {
                                it.copy(preferences = it.preferences.copy(bookingReminder = value))
                            }
                        }
                        PreferenceRow(
                            label = "Cutoff warnings",
                            description = "45 minutes before each cutoff",
                            checked = member.preferences.cutoffWarning,
                        ) { value ->
                            viewModel.updatePreference(PreferencesBody(cutoffWarning = value)) {
                                it.copy(preferences = it.preferences.copy(cutoffWarning = value))
                            }
                        }
                        PreferenceRow(
                            label = "Weekly summary",
                            description = "Meals & dues recap, every Friday",
                            checked = member.preferences.weeklySummary,
                            showDivider = false,
                        ) { value ->
                            viewModel.updatePreference(PreferencesBody(weeklySummary = value)) {
                                it.copy(preferences = it.preferences.copy(weeklySummary = value))
                            }
                        }
                    }
                }

                Spacer(Modifier.height(14.dp))
                LanguageRow(member.preferences.language) { language ->
                    viewModel.updatePreference(PreferencesBody(language = language)) {
                        it.copy(preferences = it.preferences.copy(language = language))
                    }
                }

                Spacer(Modifier.height(20.dp))
                SectionHeader("Account")
                Spacer(Modifier.height(8.dp))

                // Both of these were bare text links that fired on the first tap.
                // Reporting a card and signing out are one-way doors, so they now
                // look like buttons and ask before acting.
                KhaiCard(Modifier.fillMaxWidth(), contentPadding = PaddingValues(0.dp)) {
                    Column {
                        ActionRow(
                            label = "Report a lost or faulty card",
                            description = "Logs a report with the dining office",
                            tint = Blue,
                            onClick = { confirming = Confirmation.ReportCard },
                        )
                        Box(Modifier.fillMaxWidth().height(1.dp).background(Divider))
                        ActionRow(
                            label = "Sign out",
                            description = "You will need your phone number to sign back in",
                            tint = RedText,
                            onClick = { confirming = Confirmation.SignOut },
                        )
                    }
                }

                Spacer(Modifier.height(32.dp))
            }
        }
    }

    confirming?.let { pending ->
        ConfirmDialog(
            confirmation = pending,
            onDismiss = { confirming = null },
            onConfirm = {
                when (pending) {
                    Confirmation.SignOut -> viewModel.signOut()
                    Confirmation.ReportCard -> viewModel.reportCard("LOST")
                }
                confirming = null
            },
        )
    }
}

/** The two account actions that ask before they act. */
private enum class Confirmation { SignOut, ReportCard }

@Composable
private fun ConfirmDialog(
    confirmation: Confirmation,
    onDismiss: () -> Unit,
    onConfirm: () -> Unit,
) {
    val destructive = confirmation == Confirmation.SignOut

    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = Surface,
        shape = RoundedCornerShape(24.dp),
        title = {
            Text(
                text = if (destructive) "Sign out?" else "Report this card?",
                style = MaterialTheme.typography.titleLarge,
                color = Ink,
            )
        },
        text = {
            Text(
                text = if (destructive) {
                    "Your bookings stay as they are. You will need your phone number to sign back in."
                } else {
                    "We will log the report and you can collect a replacement from the dining office."
                },
                fontSize = 13.5.sp,
                color = InkMuted,
            )
        },
        confirmButton = {
            Text(
                text = if (destructive) "Sign out" else "Report card",
                fontSize = 13.5.sp,
                fontWeight = FontWeight.ExtraBold,
                color = if (destructive) RedText else Blue,
                modifier = Modifier
                    .clip(CircleShape)
                    .clickable(role = Role.Button, onClick = onConfirm)
                    .padding(horizontal = 14.dp, vertical = 10.dp),
            )
        },
        dismissButton = {
            Text(
                text = "Cancel",
                fontSize = 13.5.sp,
                fontWeight = FontWeight.Bold,
                color = InkFaint,
                modifier = Modifier
                    .clip(CircleShape)
                    .clickable(role = Role.Button, onClick = onDismiss)
                    .padding(horizontal = 14.dp, vertical = 10.dp),
            )
        },
    )
}

@Composable
private fun ActionRow(
    label: String,
    description: String,
    tint: Color,
    onClick: () -> Unit,
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(role = Role.Button, onClick = onClick)
            .padding(horizontal = 16.dp, vertical = 14.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Column(Modifier.weight(1f)) {
            Text(label, fontSize = 14.sp, fontWeight = FontWeight.Bold, color = tint)
            Text(description, fontSize = 12.sp, color = InkMuted, modifier = Modifier.padding(top = 1.dp))
        }
        Text("→", fontSize = 15.sp, color = tint)
    }
}

@Composable
private fun CardPanel(member: MemberDto) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(22.dp))
            .background(Brush.linearGradient(listOf(Navy, Blue)))
            .padding(20.dp),
    ) {
        Column(Modifier.heightIn(min = 110.dp), verticalArrangement = Arrangement.SpaceBetween) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text = "DINING RFID CARD",
                    style = MaterialTheme.typography.labelSmall,
                    color = Color.White.copy(alpha = 0.75f),
                    modifier = Modifier.weight(1f),
                )
                Box(Modifier.size(34.dp, 24.dp).clip(RoundedCornerShape(6.dp)).background(Red))
            }

            Text(
                text = member.card.maskedNumber ?: "No card linked",
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 3.sp,
                color = Color.White,
                modifier = Modifier.padding(vertical = 12.dp),
            )

            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text = "${member.name.uppercase()} · ${member.memberCode}",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White.copy(alpha = 0.85f),
                    modifier = Modifier.weight(1f),
                )
                StatusChip(
                    text = if (member.card.linked) "Linked ✓" else "Not linked",
                    background = Color.White.copy(alpha = 0.16f),
                    contentColor = Color.White,
                )
            }
        }
    }
}

@Composable
private fun PreferenceRow(
    label: String,
    description: String,
    checked: Boolean,
    showDivider: Boolean = true,
    onChange: (Boolean) -> Unit,
) {
    Row(
        modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 14.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Column(Modifier.weight(1f)) {
            Text(label, fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Ink)
            Text(description, fontSize = 12.sp, color = InkMuted, modifier = Modifier.padding(top = 1.dp))
        }
        Switch(
            checked = checked,
            onCheckedChange = onChange,
            colors = SwitchDefaults.colors(
                checkedThumbColor = Color.White,
                checkedTrackColor = Blue,
                uncheckedThumbColor = Color.White,
                uncheckedTrackColor = LineDashed,
            ),
        )
    }
    if (showDivider) {
        Box(Modifier.fillMaxWidth().height(1.dp).background(Divider))
    }
}

@Composable
private fun LanguageRow(language: String, onChange: (String) -> Unit) {
    KhaiCard(Modifier.fillMaxWidth()) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Column(Modifier.weight(1f)) {
                Text("App language", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Ink)
                Text(
                    text = "Labels shown in both scripts",
                    fontSize = 12.sp,
                    color = InkMuted,
                    modifier = Modifier.padding(top = 1.dp),
                )
            }

            Row(
                modifier = Modifier.clip(CircleShape).background(Muted).padding(3.dp),
                horizontalArrangement = Arrangement.spacedBy(4.dp),
            ) {
                listOf("en" to "English", "bn" to "বাংলা").forEach { (code, label) ->
                    val selected = language == code
                    Box(
                        modifier = Modifier
                            .clip(CircleShape)
                            .background(if (selected) Color.White else Color.Transparent)
                            .clickable { onChange(code) }
                            .padding(horizontal = 12.dp, vertical = 6.dp),
                    ) {
                        Text(
                            text = label,
                            fontSize = 11.5.sp,
                            fontWeight = if (selected) FontWeight.ExtraBold else FontWeight.Bold,
                            color = if (selected) Navy else InkFaint,
                        )
                    }
                }
            }
        }
    }
}
