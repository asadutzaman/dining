package com.khaidai.feature.booking

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewModelScope
import com.khaidai.core.common.Outcome
import com.khaidai.core.data.network.BookingDto
import com.khaidai.core.data.network.BookingGroupDto
import com.khaidai.core.data.repository.BookingRepository
import com.khaidai.core.designsystem.component.*
import com.khaidai.core.designsystem.theme.*
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class BookingsUiState(
    val tab: Tab = Tab.Upcoming,
    val groups: List<BookingGroupDto> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null,
) {
    enum class Tab { Upcoming, Past }
}

@HiltViewModel
class BookingsViewModel @Inject constructor(
    private val repository: BookingRepository,
) : ViewModel() {

    private val _state = MutableStateFlow(BookingsUiState())
    val state: StateFlow<BookingsUiState> = _state.asStateFlow()

    init { load() }

    fun selectTab(tab: BookingsUiState.Tab) {
        if (tab == _state.value.tab) return
        // Clear immediately so the previous tab's rows never appear under the
        // new tab's heading while the fetch is in flight.
        _state.update { it.copy(tab = tab, groups = emptyList()) }
        load()
    }

    fun load() {
        viewModelScope.launch {
            _state.update { it.copy(isLoading = true, error = null) }

            val result = when (_state.value.tab) {
                BookingsUiState.Tab.Upcoming -> repository.upcoming()
                BookingsUiState.Tab.Past -> repository.history()
            }

            when (result) {
                is Outcome.Success -> _state.update { it.copy(groups = result.data, isLoading = false) }
                is Outcome.Failure -> _state.update { it.copy(isLoading = false, error = result.message) }
            }
        }
    }

    fun cancel(booking: BookingDto) {
        viewModelScope.launch {
            when (val result = repository.cancel(booking.mealDate, booking.mealType)) {
                is Outcome.Success -> load()
                is Outcome.Failure -> _state.update { it.copy(error = result.message) }
            }
        }
    }

    fun dismissError() = _state.update { it.copy(error = null) }
}

/** Screen 1d. */
@Composable
fun BookingsRoute(viewModel: BookingsViewModel = hiltViewModel()) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    Column(Modifier.fillMaxSize().background(Canvas)) {
        Column(Modifier.padding(horizontal = 24.dp)) {
            Spacer(Modifier.height(56.dp))
            Text("My bookings", style = MaterialTheme.typography.headlineSmall, color = Ink)
            Text("আমার বুকিং", fontSize = 12.5.sp, color = InkMuted, modifier = Modifier.padding(top = 2.dp))

            Spacer(Modifier.height(14.dp))

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(CircleShape)
                    .background(Muted)
                    .padding(4.dp),
            ) {
                BookingsUiState.Tab.entries.forEach { tab ->
                    val selected = state.tab == tab
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(CircleShape)
                            .background(if (selected) Color.White else Color.Transparent)
                            .clickable { viewModel.selectTab(tab) }
                            .padding(vertical = 11.dp),
                        contentAlignment = Alignment.Center,
                    ) {
                        Text(
                            text = tab.name,
                            fontSize = 13.5.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = if (selected) Navy else InkFaint,
                        )
                    }
                }
            }

            if (state.error != null) {
                Spacer(Modifier.height(12.dp))
                ErrorBanner(message = state.error, onDismiss = viewModel::dismissError)
            }
        }

        when {
            state.isLoading && state.groups.isEmpty() -> LoadingIndicator(Modifier.padding(top = 60.dp))

            state.groups.isEmpty() -> CenteredMessage(
                text = when (state.tab) {
                    BookingsUiState.Tab.Upcoming -> "Nothing booked yet. Plan your week to get started."
                    BookingsUiState.Tab.Past -> "No past meals in this period."
                },
                modifier = Modifier.padding(top = 60.dp),
            )

            else -> LazyColumn(
                contentPadding = PaddingValues(start = 24.dp, end = 24.dp, top = 16.dp, bottom = 32.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp),
            ) {
                state.groups.forEach { group ->
                    item(key = "h-${group.mealDate}") {
                        SectionHeader(group.label, Modifier.padding(top = 8.dp))
                    }
                    items(group.bookings, key = { it.id }) { booking ->
                        BookingCard(booking) { viewModel.cancel(booking) }
                    }
                }
            }
        }
    }
}

@Composable
private fun BookingCard(booking: BookingDto, onCancel: () -> Unit) {
    val meal = booking.mealType.lowercase().replaceFirstChar(Char::uppercase)

    val (boxColor, boxGlyph, boxText) = when (booking.bookingStatus) {
        "CONSUMED" -> Triple(BlueSurface, "✓", BlueMuted)
        "MISSED" -> Triple(RedTint, "✕", RedText)
        "CANCELLED" -> Triple(Muted, "—", InkFaint)
        else -> Triple(Blue, "✓", Color.White)
    }

    KhaiCard(
        modifier = Modifier.fillMaxWidth(),
        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 14.dp),
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier.size(38.dp).clip(RoundedCornerShape(12.dp)).background(boxColor),
                contentAlignment = Alignment.Center,
            ) {
                Text(boxGlyph, color = boxText, fontSize = 14.sp, fontWeight = FontWeight.ExtraBold)
            }

            Column(Modifier.weight(1f).padding(start = 12.dp)) {
                Row {
                    Text(
                        text = "$meal · ",
                        fontSize = 14.5.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (booking.bookingStatus == "CANCELLED") InkMuted else Ink,
                    )
                    // A cancelled meal shows the price it would have cost, struck
                    // through, so the ৳0 is unmistakably a waiver.
                    if (booking.bookingStatus == "CANCELLED") {
                        Text(
                            text = "৳${booking.unitPrice.toInt()}",
                            fontSize = 14.5.sp,
                            fontWeight = FontWeight.Bold,
                            color = InkFaint,
                            textDecoration = TextDecoration.LineThrough,
                        )
                        Text(" ৳0", fontSize = 14.5.sp, fontWeight = FontWeight.Bold, color = InkFaint)
                    } else {
                        Text(
                            text = "৳${booking.unitPrice.toInt()}",
                            fontSize = 14.5.sp,
                            fontWeight = FontWeight.Bold,
                            color = Ink,
                        )
                    }
                }

                Text(
                    text = caption(booking),
                    fontSize = 12.sp,
                    fontWeight = if (booking.bookingStatus == "MISSED") FontWeight.SemiBold else FontWeight.Normal,
                    color = if (booking.bookingStatus == "MISSED") RedText else InkMuted,
                    modifier = Modifier.padding(top = 1.dp),
                )
            }

            when {
                booking.canCancel -> Box(
                    modifier = Modifier
                        .clip(CircleShape)
                        .border(1.5.dp, RedBorder, CircleShape)
                        .clickable(onClick = onCancel)
                        .padding(horizontal = 13.dp, vertical = 9.dp),
                ) {
                    Text("Cancel", color = RedText, fontSize = 12.sp, fontWeight = FontWeight.ExtraBold)
                }

                booking.bookingStatus == "CONSUMED" -> StatusChip("Consumed", BlueSurface, BlueDeepText)
                booking.bookingStatus == "MISSED" -> StatusChip("Missed", RedTint, RedText)
                booking.bookingStatus == "CANCELLED" -> StatusChip("Cancelled", Muted, InkFaint)
                else -> StatusChip("Locked", MutedDeep, LockedText)
            }
        }
    }
}

private fun caption(booking: BookingDto): String = when (booking.bookingStatus) {
    "CONSUMED" -> listOfNotNull(
        booking.consumedAt?.substringAfter(' ')?.take(5)?.let { "Scanned $it" },
        booking.tokenNumber?.let { "token $it" },
    ).joinToString(" · ").ifBlank { "Served" }

    "MISSED" -> "Not scanned — still charged"
    "CANCELLED" -> "Cancelled before cutoff"
    else -> booking.cutoffAt?.let { "Cancel until ${it.substringAfter(' ').take(5)}" } ?: "Booked"
}
