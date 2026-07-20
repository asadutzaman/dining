package com.khaidai.feature.booking

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.khaidai.core.common.Outcome
import com.khaidai.core.data.network.DayPlanDto
import com.khaidai.core.data.network.MealCellDto
import com.khaidai.core.data.network.PlanDto
import com.khaidai.core.data.network.SyncDayBody
import com.khaidai.core.data.repository.BookingRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class WeekUiState(
    val plan: PlanDto? = null,
    /** Cells the member has toggled but not yet confirmed, keyed "date|MEAL". */
    val pending: Map<String, Boolean> = emptyMap(),
    val isLoading: Boolean = false,
    val isSaving: Boolean = false,
    val error: String? = null,
    val message: String? = null,
) {
    /**
     * Whether a cell reads as booked right now: the pending edit if the member
     * touched it, otherwise whatever the server last said.
     */
    fun isBooked(date: String, meal: MealCellDto): Boolean =
        pending["$date|${meal.mealType}"] ?: (meal.state == "BOOKED")

    val hasChanges: Boolean get() = pending.isNotEmpty()

    /** Live footer total, counting pending edits. */
    val selectedCount: Int
        get() = plan?.days.orEmpty().sumOf { day ->
            day.meals.count { it.state != "CONSUMED" && it.state != "MISSED" && isBooked(day.mealDate, it) }
        }

    val selectedTotal: Double
        get() = plan?.days.orEmpty().sumOf { day ->
            day.meals.filter { it.state != "CONSUMED" && it.state != "MISSED" && isBooked(day.mealDate, it) }
                .sumOf { it.price }
        }
}

@HiltViewModel
class WeekViewModel @Inject constructor(
    private val repository: BookingRepository,
) : ViewModel() {

    private val _state = MutableStateFlow(WeekUiState())
    val state: StateFlow<WeekUiState> = _state.asStateFlow()

    init { load() }

    fun load() {
        viewModelScope.launch {
            _state.update { it.copy(isLoading = true, error = null) }

            when (val result = repository.plan()) {
                is Outcome.Success ->
                    // Pending edits are dropped on reload: the server's answer is
                    // now the truth, and keeping stale toggles would misreport it.
                    _state.update { it.copy(plan = result.data, pending = emptyMap(), isLoading = false) }

                is Outcome.Failure ->
                    _state.update { it.copy(isLoading = false, error = result.message) }
            }
        }
    }

    /**
     * Toggle a cell. Locked and already-settled cells are ignored -- the server
     * flagged them and the UI must not offer an action it cannot honour.
     */
    fun toggle(date: String, meal: MealCellDto) {
        if (meal.locked || meal.state == "CONSUMED" || meal.state == "MISSED") return

        _state.update { state ->
            val key = "$date|${meal.mealType}"
            val serverValue = meal.state == "BOOKED"
            val next = !state.isBooked(date, meal)

            state.copy(
                // Toggling back to the server's value is not a change, so the
                // entry is removed and the footer stops offering to save.
                pending = if (next == serverValue) state.pending - key else state.pending + (key to next),
                message = null,
            )
        }
    }

    /** "Repeat my usual week" -- a proposal staged as pending edits, not a save. */
    fun repeatUsual() {
        val plan = _state.value.plan ?: return

        viewModelScope.launch {
            when (val result = repository.usualWeek(plan.from, plan.to)) {
                is Outcome.Success -> {
                    val suggested = result.data.days.associate { it.mealDate to it.mealTypes.toSet() }
                    _state.update { state ->
                        state.copy(
                            pending = buildPending(plan.days) { date, meal ->
                                suggested[date]?.contains(meal.mealType) == true
                            },
                            message = "Your usual week is staged — press Confirm to save.",
                        )
                    }
                }

                is Outcome.Failure -> _state.update { it.copy(error = result.message) }
            }
        }
    }

    fun clearWeek() {
        val plan = _state.value.plan ?: return
        _state.update { state ->
            state.copy(pending = buildPending(plan.days) { _, _ -> false }, message = null)
        }
    }

    fun confirm() {
        val state = _state.value
        val plan = state.plan ?: return
        if (!state.hasChanges || state.isSaving) return

        viewModelScope.launch {
            _state.update { it.copy(isSaving = true, error = null, message = null) }

            // The API takes the desired end state per day, so every editable day
            // is sent in full rather than as a diff.
            val days = plan.days.map { day ->
                SyncDayBody(
                    mealDate = day.mealDate,
                    mealTypes = day.meals
                        .filter { it.state != "CONSUMED" && it.state != "MISSED" && !it.locked }
                        .filter { state.isBooked(day.mealDate, it) }
                        .map { it.mealType },
                )
            }

            when (val result = repository.syncWeek(days)) {
                is Outcome.Success -> {
                    _state.update {
                        it.copy(
                            plan = PlanDto(plan.from, plan.to, result.data.days, result.data.totals),
                            pending = emptyMap(),
                            isSaving = false,
                            message = "Week saved.",
                        )
                    }
                }

                is Outcome.Failure ->
                    _state.update { it.copy(isSaving = false, error = result.message) }
            }
        }
    }

    fun dismissMessages() = _state.update { it.copy(error = null, message = null) }

    /**
     * Stage a value for every cell the member is allowed to change, leaving
     * locked and settled ones alone.
     */
    private inline fun buildPending(
        days: List<DayPlanDto>,
        wanted: (String, MealCellDto) -> Boolean,
    ): Map<String, Boolean> = buildMap {
        days.forEach { day ->
            day.meals.forEach { meal ->
                if (meal.locked || meal.state == "CONSUMED" || meal.state == "MISSED") return@forEach

                val target = wanted(day.mealDate, meal)
                if (target != (meal.state == "BOOKED")) {
                    put("${day.mealDate}|${meal.mealType}", target)
                }
            }
        }
    }
}
