package com.khaidai.feature.account

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
import com.khaidai.core.data.network.ChargeDto
import com.khaidai.core.data.network.DuesDto
import com.khaidai.core.data.repository.DuesRepository
import com.khaidai.core.designsystem.component.*
import com.khaidai.core.designsystem.theme.*
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class DuesUiState(
    val dues: DuesDto? = null,
    val charges: List<ChargeDto> = emptyList(),
    val month: String? = null,
    val isLoading: Boolean = false,
    val error: String? = null,
)

@HiltViewModel
class DuesViewModel @Inject constructor(
    private val repository: DuesRepository,
) : ViewModel() {

    private val _state = MutableStateFlow(DuesUiState())
    val state: StateFlow<DuesUiState> = _state.asStateFlow()

    init { load(null) }

    fun load(month: String?) {
        viewModelScope.launch {
            _state.update { it.copy(isLoading = true, error = null, month = month) }

            // Summary and ledger are independent reads; failing to load the
            // ledger should not blank the headline due figure.
            when (val dues = repository.dues(month)) {
                is Outcome.Success -> _state.update { it.copy(dues = dues.data, isLoading = false) }
                is Outcome.Failure -> _state.update { it.copy(isLoading = false, error = dues.message) }
            }

            when (val charges = repository.charges(month)) {
                is Outcome.Success -> _state.update { it.copy(charges = charges.data) }
                is Outcome.Failure -> Unit
            }
        }
    }

    fun dismissError() = _state.update { it.copy(error = null) }
}

/** Screen 1e. */
@Composable
fun DuesRoute(viewModel: DuesViewModel = hiltViewModel()) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    LazyColumn(
        modifier = Modifier.fillMaxSize().background(Canvas),
        contentPadding = PaddingValues(start = 24.dp, end = 24.dp, bottom = 32.dp),
    ) {
        item {
            ScreenHeader(title = "Dues & payments", subtitle = "বকেয়া ও পেমেন্ট")
            Spacer(Modifier.height(14.dp))
        }

        if (state.error != null) {
            item {
                ErrorBanner(message = state.error, onDismiss = viewModel::dismissError)
                Spacer(Modifier.height(12.dp))
            }
        }

        state.dues?.let { dues ->
            item { DueCard(dues); Spacer(Modifier.height(16.dp)) }

            item {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    dues.months.forEach { chip ->
                        Box(
                            modifier = Modifier
                                .clip(CircleShape)
                                .background(if (chip.selected) Ink else Color.Transparent)
                                .then(
                                    if (chip.selected) Modifier
                                    else Modifier.border(1.5.dp, LineStrong, CircleShape),
                                )
                                .clickable { viewModel.load(chip.value) }
                                .padding(horizontal = 15.dp, vertical = 9.dp),
                        ) {
                            Text(
                                text = chip.label,
                                fontSize = 12.5.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = if (chip.selected) Canvas else InkFaint,
                            )
                        }
                    }
                }
                Spacer(Modifier.height(16.dp))
            }
        }

        if (state.isLoading && state.dues == null) {
            item { LoadingIndicator() }
        }

        if (state.charges.isNotEmpty()) {
            item { SectionHeader("Recent charges"); Spacer(Modifier.height(8.dp)) }
            items(state.charges, key = { it.id }) { charge ->
                ChargeRow(charge)
            }
        }
    }
}

@Composable
private fun DueCard(dues: DuesDto) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(26.dp))
            .background(Navy)
            .padding(20.dp),
    ) {
        Column {
            Text("CURRENT DUE", style = MaterialTheme.typography.labelSmall, color = Color.White.copy(alpha = 0.7f))
            Text(
                text = "৳${dues.currentDue.toInt()}",
                style = MaterialTheme.typography.displaySmall,
                color = Color.White,
                modifier = Modifier.padding(top = 4.dp),
            )
            Text(
                text = "${dues.summary.meals} meals ${dues.summary.sinceLabel} · settled with the monthly bill",
                fontSize = 12.5.sp,
                color = Color.White.copy(alpha = 0.78f),
                modifier = Modifier.padding(top = 2.dp),
            )

            Row(
                modifier = Modifier.padding(top = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                dues.byMealType.forEach { total ->
                    Column(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(14.dp))
                            .background(Color.White.copy(alpha = 0.1f))
                            .padding(horizontal = 12.dp, vertical = 10.dp),
                    ) {
                        Text(
                            text = total.label,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White.copy(alpha = 0.7f),
                        )
                        Text(
                            text = "${total.count} · ৳${total.amount.toInt()}",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = Color.White,
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun ChargeRow(charge: ChargeDto) {
    val waived = charge.chargeStatus == "WAIVED"

    KhaiCard(
        modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp),
        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 13.dp),
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Column(Modifier.weight(1f)) {
                Text(
                    text = charge.title,
                    fontSize = 13.5.sp,
                    fontWeight = FontWeight.Bold,
                    color = if (waived) InkMuted else Ink,
                )
                charge.caption?.let {
                    Text(
                        text = it,
                        fontSize = 11.5.sp,
                        fontWeight = if (charge.bookingStatus == "MISSED") FontWeight.SemiBold else FontWeight.Normal,
                        color = if (charge.bookingStatus == "MISSED") RedText else InkMuted,
                    )
                }
            }

            if (waived) {
                Text(
                    text = "৳${charge.originalPrice.toInt()}",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = InkFaint,
                    textDecoration = TextDecoration.LineThrough,
                )
                Text(" ৳0", fontSize = 14.sp, fontWeight = FontWeight.ExtraBold, color = InkFaint)
            } else {
                Text(
                    text = "৳${charge.chargedAmount.toInt()}",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = Ink,
                )
            }

            Spacer(Modifier.width(10.dp))

            when {
                waived -> StatusChip("Waived", Muted, InkFaint)
                charge.bookingStatus == "MISSED" -> StatusChip("Charged", RedTint, RedText)
                else -> StatusChip("Charged", BlueSurface, BlueDeepText)
            }
        }
    }
}
