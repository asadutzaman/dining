package com.khaidai.feature.booking

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
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
import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewModelScope
import com.khaidai.core.common.Outcome
import com.khaidai.core.data.network.DayPlanDto
import com.khaidai.core.data.network.MealCellDto
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

data class DayUiState(
    val days: List<DayPlanDto> = emptyList(),
    val selectedDate: String? = null,
    val pending: Map<String, Boolean> = emptyMap(),
    val isLoading: Boolean = false,
    val isSaving: Boolean = false,
    val error: String? = null,
    val savedMessage: String? = null,
) {
    val selectedDay: DayPlanDto? get() = days.firstOrNull { it.mealDate == selectedDate }

    fun isBooked(meal: MealCellDto): Boolean =
        pending[meal.mealType] ?: (meal.state == "BOOKED")

    val hasChanges: Boolean get() = pending.isNotEmpty()

    val selectedMeals: List<MealCellDto>
        get() = selectedDay?.meals.orEmpty()
            .filter { it.state != "CONSUMED" && it.state != "MISSED" && isBooked(it) }

    val total: Double get() = selectedMeals.sumOf { it.price }
}

@HiltViewModel
class DayViewModel @Inject constructor(
    private val repository: BookingRepository,
    savedStateHandle: SavedStateHandle,
) : ViewModel() {

    private val initialDate: String? = savedStateHandle["date"]

    private val _state = MutableStateFlow(DayUiState())
    val state: StateFlow<DayUiState> = _state.asStateFlow()

    init { load() }

    fun load() {
        viewModelScope.launch {
            _state.update { it.copy(isLoading = true, error = null) }

            when (val result = repository.plan()) {
                is Outcome.Success -> _state.update {
                    val days = result.data.days
                    it.copy(
                        days = days,
                        // Honour the date we were navigated with; fall back to
                        // today, then to whatever the range starts at.
                        selectedDate = it.selectedDate
                            ?: initialDate?.takeIf { d -> days.any { day -> day.mealDate == d } }
                            ?: days.firstOrNull { day -> day.isToday }?.mealDate
                            ?: days.firstOrNull()?.mealDate,
                        pending = emptyMap(),
                        isLoading = false,
                    )
                }

                is Outcome.Failure -> _state.update { it.copy(isLoading = false, error = result.message) }
            }
        }
    }

    // Changing day discards staged edits for the previous one -- they were never
    // committed, and carrying them across dates would silently book the wrong day.
    fun selectDate(date: String) = _state.update { it.copy(selectedDate = date, pending = emptyMap()) }

    fun toggle(meal: MealCellDto) {
        if (meal.locked || meal.state == "CONSUMED" || meal.state == "MISSED") return

        _state.update { state ->
            val next = !state.isBooked(meal)
            val serverValue = meal.state == "BOOKED"
            state.copy(
                pending = if (next == serverValue) state.pending - meal.mealType
                else state.pending + (meal.mealType to next),
                savedMessage = null,
            )
        }
    }

    fun confirm() {
        val state = _state.value
        val day = state.selectedDay ?: return
        if (!state.hasChanges || state.isSaving) return

        viewModelScope.launch {
            _state.update { it.copy(isSaving = true, error = null) }

            val wanted = day.meals
                .filter { it.state != "CONSUMED" && it.state != "MISSED" && !it.locked }
                .filter { state.isBooked(it) }
                .map { it.mealType }

            when (val result = repository.syncDay(day.mealDate, wanted)) {
                is Outcome.Success -> {
                    val updated = result.data.day
                    _state.update { current ->
                        current.copy(
                            days = if (updated != null) {
                                current.days.map { if (it.mealDate == updated.mealDate) updated else it }
                            } else {
                                current.days
                            },
                            pending = emptyMap(),
                            isSaving = false,
                            savedMessage = "Booking confirmed.",
                        )
                    }
                }

                is Outcome.Failure -> _state.update { it.copy(isSaving = false, error = result.message) }
            }
        }
    }

    fun dismissMessages() = _state.update { it.copy(error = null, savedMessage = null) }
}

/** Screen 1c -- pick a day, then pick its meals. */
@Composable
fun DayRoute(
    onBack: () -> Unit,
    viewModel: DayViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    Column(Modifier.fillMaxSize().background(Canvas)) {
        Column(
            Modifier.weight(1f).verticalScroll(rememberScrollState()).padding(horizontal = 24.dp),
        ) {
            ScreenHeader(
                title = "Book a meal",
                subtitle = "দিন বেছে খাবার বুক করুন",
                onBack = onBack,
            )

            Spacer(Modifier.height(16.dp))

            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                state.days.forEach { day ->
                    DateChip(
                        day = day,
                        selected = day.mealDate == state.selectedDate,
                        onClick = { viewModel.selectDate(day.mealDate) },
                        modifier = Modifier.weight(1f),
                    )
                }
            }

            Spacer(Modifier.height(16.dp))

            state.selectedDay?.let { day ->
                SectionHeader("Meals for ${day.dayFull} ${day.dayOfMonth}")
                Spacer(Modifier.height(10.dp))

                day.meals.forEach { meal ->
                    MealOption(
                        meal = meal,
                        selected = state.isBooked(meal),
                        onClick = { viewModel.toggle(meal) },
                        modifier = Modifier.padding(bottom = 10.dp),
                    )
                }
            }

            if (state.error != null || state.savedMessage != null) {
                Spacer(Modifier.height(6.dp))
                ErrorBanner(message = state.error ?: state.savedMessage, onDismiss = viewModel::dismissMessages)
            }

            Spacer(Modifier.height(14.dp))
            Row {
                Box(
                    modifier = Modifier
                        .padding(top = 1.dp)
                        .size(16.dp)
                        .clip(CircleShape)
                        .background(BlueTint),
                    contentAlignment = Alignment.Center,
                ) {
                    Text("i", color = Blue, fontSize = 10.sp, fontWeight = FontWeight.ExtraBold)
                }
                Text(
                    text = "You can cancel any booking free of charge until its cutoff. Missed bookings are still charged.",
                    fontSize = 12.sp,
                    color = InkMuted,
                    lineHeight = 18.sp,
                    modifier = Modifier.padding(start = 8.dp),
                )
            }

            Spacer(Modifier.height(20.dp))
        }

        KhaiCard(
            modifier = Modifier.fillMaxWidth().padding(16.dp),
            shape = RoundedCornerShape(22.dp),
            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 14.dp),
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Column(Modifier.weight(1f)) {
                    Text(
                        text = "${state.selectedMeals.size} meals · ৳${state.total.toInt()}",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = Ink,
                    )
                    Text(
                        text = state.selectedDay?.let { "${it.dayFull} ${it.dayOfMonth}" } ?: "",
                        fontSize = 11.5.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = InkMuted,
                    )
                }
                PillButton(
                    text = "Confirm booking",
                    onClick = viewModel::confirm,
                    enabled = state.hasChanges,
                    loading = state.isSaving,
                )
            }
        }
    }
}

@Composable
private fun DateChip(day: DayPlanDto, selected: Boolean, onClick: () -> Unit, modifier: Modifier = Modifier) {
    Column(
        modifier = modifier
            .clip(RoundedCornerShape(16.dp))
            .background(if (selected) Blue else Color.White)
            .border(1.5.dp, if (selected) Blue else Line, RoundedCornerShape(16.dp))
            .clickable(onClick = onClick)
            .padding(vertical = 10.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text(
            text = day.dayShort,
            fontSize = 10.5.sp,
            fontWeight = FontWeight.Bold,
            color = if (selected) Color.White.copy(alpha = 0.75f) else InkMuted,
        )
        Text(
            text = "${day.dayOfMonth}",
            fontSize = 16.sp,
            fontWeight = FontWeight.ExtraBold,
            color = if (selected) Color.White else Ink,
        )
    }
}

@Composable
private fun MealOption(
    meal: MealCellDto,
    selected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val settled = meal.state == "CONSUMED" || meal.state == "MISSED"
    val disabled = settled || meal.locked

    KhaiCard(
        modifier = modifier.fillMaxWidth().clickable(enabled = !disabled, onClick = onClick),
        borderColor = if (selected && !disabled) Blue else if (disabled) LineStrong else Line,
        background = when {
            disabled -> MutedDeep.copy(alpha = 0.4f)
            selected -> BlueSelected
            else -> Color.White
        },
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier
                    .size(26.dp)
                    .clip(RoundedCornerShape(9.dp))
                    .background(if (selected && !disabled) Blue else Color.White)
                    .then(
                        if (!selected || disabled) {
                            Modifier.border(1.5.dp, LineDashed, RoundedCornerShape(9.dp))
                        } else {
                            Modifier
                        },
                    ),
                contentAlignment = Alignment.Center,
            ) {
                if (selected && !disabled) {
                    Text("✓", color = Color.White, fontSize = 15.sp, fontWeight = FontWeight.ExtraBold)
                }
            }

            Column(Modifier.weight(1f).padding(start = 14.dp)) {
                Text(
                    text = meal.mealType.lowercase().replaceFirstChar(Char::uppercase),
                    fontSize = 15.5.sp,
                    fontWeight = FontWeight.Bold,
                    color = Ink,
                )
                if (meal.servingFrom != null && meal.servingTo != null) {
                    Text(
                        text = "Served ${meal.servingFrom!!.take(5)} – ${meal.servingTo!!.take(5)}",
                        fontSize = 12.5.sp,
                        color = InkMuted,
                        modifier = Modifier.padding(top = 2.dp),
                    )
                }
                meal.cutoffLabel?.let {
                    Text(
                        text = it,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (meal.locked) RedText else RedDeep,
                        modifier = Modifier.padding(top = 4.dp),
                    )
                }
            }

            Text("৳${meal.price.toInt()}", fontSize = 16.sp, fontWeight = FontWeight.ExtraBold, color = Ink)
        }
    }
}
