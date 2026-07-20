package com.khaidai.feature.home

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewModelScope
import com.khaidai.core.common.Outcome
import com.khaidai.core.common.UiState
import com.khaidai.core.data.network.NotificationDto
import com.khaidai.core.data.network.NotificationFeedDto
import com.khaidai.core.data.repository.NotificationRepository
import com.khaidai.core.designsystem.component.*
import com.khaidai.core.designsystem.theme.*
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class NotificationsViewModel @Inject constructor(
    private val repository: NotificationRepository,
) : ViewModel() {

    private val _state = MutableStateFlow(UiState<NotificationFeedDto>())
    val state: StateFlow<UiState<NotificationFeedDto>> = _state.asStateFlow()

    init { load() }

    fun load() {
        viewModelScope.launch {
            _state.update { it.loading() }
            when (val result = repository.feed()) {
                is Outcome.Success -> _state.update { it.success(result.data) }
                is Outcome.Failure -> _state.update { it.failure(result.message) }
            }
        }
    }

    fun markAllRead() {
        viewModelScope.launch {
            // Optimistic: the feed is read-only information, so showing it as read
            // immediately costs nothing if the call later fails.
            _state.update { state ->
                val feed = state.content ?: return@update state
                state.success(
                    feed.copy(
                        unreadCount = 0,
                        sections = feed.sections.map { section ->
                            section.copy(items = section.items.map { it.copy(isRead = true) })
                        },
                    ),
                )
            }
            repository.markAllRead()
        }
    }

    fun dismiss(id: Long) {
        viewModelScope.launch {
            repository.dismiss(id)
            load()
        }
    }
}

@Composable
fun NotificationsRoute(
    onBack: () -> Unit,
    onOpenRoute: (String) -> Unit,
    viewModel: NotificationsViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    Column(Modifier.fillMaxSize().background(Canvas)) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(start = 24.dp, end = 24.dp, top = 56.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Column(Modifier.weight(1f)) {
                Text("Notifications", style = MaterialTheme.typography.headlineSmall, color = Ink)
                Text("নোটিফিকেশন", fontSize = 12.5.sp, color = InkMuted, modifier = Modifier.padding(top = 2.dp))
            }
            Text(
                text = "Mark all read",
                fontSize = 12.5.sp,
                fontWeight = FontWeight.ExtraBold,
                color = Blue,
                modifier = Modifier.clickable(onClick = viewModel::markAllRead),
            )
        }

        when {
            state.isInitialLoading -> LoadingIndicator(Modifier.padding(top = 80.dp))

            state.content?.sections.isNullOrEmpty() -> CenteredMessage(
                text = state.error ?: "Nothing here yet.",
                modifier = Modifier.padding(top = 80.dp),
            )

            else -> LazyColumn(
                contentPadding = PaddingValues(start = 24.dp, end = 24.dp, top = 18.dp, bottom = 32.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                state.content!!.sections.forEach { section ->
                    item(key = "h-${section.date}") {
                        SectionHeader(section.label, Modifier.padding(top = 10.dp, bottom = 2.dp))
                    }
                    items(section.items, key = { it.id }) { item ->
                        NotificationCard(
                            item = item,
                            onClick = { item.actionRoute?.let(onOpenRoute) },
                            onDismiss = { viewModel.dismiss(item.id) },
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun NotificationCard(
    item: NotificationDto,
    onClick: () -> Unit,
    onDismiss: () -> Unit,
) {
    // Unread and urgent items carry a red edge; everything else stays quiet.
    val isUrgent = item.type == "CUTOFF_WARNING" && !item.isRead

    KhaiCard(
        modifier = Modifier.fillMaxWidth().clickable(onClick = onClick),
        borderColor = if (isUrgent) RedBorder else Line,
        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 14.dp),
    ) {
        Row {
            Box(
                modifier = Modifier
                    .padding(top = 5.dp)
                    .size(10.dp)
                    .clip(CircleShape)
                    .background(
                        when {
                            isUrgent -> Red
                            item.type == "BOOKING_CANCELLED" -> RedText
                            !item.isRead -> Blue
                            else -> LineDashed
                        },
                    ),
            )

            Column(Modifier.weight(1f).padding(start = 12.dp)) {
                Row {
                    Text(
                        text = item.title,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = Ink,
                        modifier = Modifier.weight(1f),
                    )
                    Text(item.timeLabel, fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = InkFaint)
                }
                Text(
                    text = item.body,
                    fontSize = 12.5.sp,
                    color = InkSoft,
                    lineHeight = 18.sp,
                    modifier = Modifier.padding(top = 2.dp),
                )

                if (isUrgent) {
                    Row(
                        modifier = Modifier.padding(top = 10.dp),
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                    ) {
                        Box(
                            modifier = Modifier
                                .clip(CircleShape)
                                .background(Blue)
                                .clickable(onClick = onClick)
                                .padding(horizontal = 13.dp, vertical = 8.dp),
                        ) {
                            Text("Book now", color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.ExtraBold)
                        }
                        Box(
                            modifier = Modifier
                                .clip(CircleShape)
                                .background(Muted)
                                .clickable(onClick = onDismiss)
                                .padding(horizontal = 13.dp, vertical = 8.dp),
                        ) {
                            Text("Dismiss", color = InkSoft, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }
}
