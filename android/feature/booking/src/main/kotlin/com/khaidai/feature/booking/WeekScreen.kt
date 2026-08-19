package com.khaidai.feature.booking

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.khaidai.core.data.network.DayPlanDto
import com.khaidai.core.data.network.MealCellDto
import com.khaidai.core.designsystem.component.*
import com.khaidai.core.designsystem.theme.*
import java.time.LocalDate
import java.time.format.DateTimeFormatter

/**
 * Screen 1b -- the weekly grid. Seven rows by three meals, each cell a single tap.
 * Edits are staged locally and committed together, so planning a week is one
 * network call rather than twenty-one.
 */
@Composable
fun WeekRoute(viewModel: WeekViewModel = hiltViewModel()) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    Column(Modifier.fillMaxSize().background(Canvas)) {
        Column(
            Modifier
                .weight(1f)
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 24.dp),
        ) {
            ScreenHeader(
                title = "Plan your week",
                // The API sends ISO dates. Showing them raw leaked a machine
                // format into the one line that should read as a human date, and
                // it displaced the Bengali subtitle every other screen carries.
                subtitle = state.plan?.let { "${formatRange(it.from, it.to)} · সপ্তাহের খাবার" }
                    ?: "সপ্তাহের খাবার বুক করুন",
            )

            Spacer(Modifier.height(14.dp))

            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(999.dp))
                        .background(BlueTint)
                        .clickable(onClick = viewModel::repeatUsual)
                        .padding(horizontal = 15.dp, vertical = 10.dp),
                ) {
                    Text("↻ Repeat my usual week", color = Navy, fontSize = 12.5.sp, fontWeight = FontWeight.ExtraBold)
                }
                GhostPillButton(text = "Clear", onClick = viewModel::clearWeek)
            }

            Spacer(Modifier.height(14.dp))

            if (state.error != null || state.message != null) {
                ErrorBanner(message = state.error ?: state.message, onDismiss = viewModel::dismissMessages)
                Spacer(Modifier.height(12.dp))
            }

            when {
                state.isLoading && state.plan == null -> LoadingIndicator()
                state.plan == null -> CenteredMessage("Couldn't load your week.")
                else -> Grid(state, viewModel)
            }

            Spacer(Modifier.height(16.dp))
            Legend()
            Spacer(Modifier.height(20.dp))
        }

        ConfirmBar(state, viewModel)
    }
}

/**
 * Wide enough for the longest day name beside the TODAY pill. The grid header
 * spacer and every row read from this, so the columns cannot drift apart.
 */
private val DayColumnWidth = 88.dp

/** "2026-07-18", "2026-07-24" -> "18 – 24 Jul". */
private fun formatRange(from: String, to: String): String = runCatching {
    val start = LocalDate.parse(from)
    val end = LocalDate.parse(to)
    val month = DateTimeFormatter.ofPattern("MMM")

    if (start.month == end.month) {
        "${start.dayOfMonth} – ${end.dayOfMonth} ${end.format(month)}"
    } else {
        "${start.dayOfMonth} ${start.format(month)} – ${end.dayOfMonth} ${end.format(month)}"
    }
    // A malformed date is not worth crashing a screen over; the raw range is
    // still readable, just uglier.
}.getOrDefault("$from – $to")

@Composable
private fun Grid(state: WeekUiState, viewModel: WeekViewModel) {
    // Column headers carry the price, so the member sees the cost of a cell
    // before tapping it.
    Row(
        modifier = Modifier.fillMaxWidth().padding(start = 8.dp, bottom = 6.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalAlignment = Alignment.Bottom,
    ) {
        Spacer(Modifier.width(DayColumnWidth))
        val firstDay = state.plan?.days?.firstOrNull()
        listOf("Breakfast", "Lunch", "Dinner").forEachIndexed { index, label ->
            Column(Modifier.weight(1f), horizontalAlignment = Alignment.CenterHorizontally) {
                Text(label, fontSize = 12.sp, fontWeight = FontWeight.ExtraBold, color = Ink)
                firstDay?.meals?.getOrNull(index)?.let {
                    Text("৳${it.price.toInt()}", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = InkMuted)
                }
            }
        }
    }

    state.plan?.days?.forEach { day ->
        DayRow(day, state, viewModel)
    }
}

@Composable
private fun DayRow(day: DayPlanDto, state: WeekUiState, viewModel: WeekViewModel) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 2.dp)
            .clip(RoundedCornerShape(16.dp))
            .background(if (day.isToday) BlueSelected else Color.Transparent)
            .padding(horizontal = 8.dp, vertical = 5.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Column(Modifier.width(DayColumnWidth)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(day.dayShort, fontSize = 14.sp, fontWeight = FontWeight.ExtraBold, color = Ink)
                if (day.isToday) {
                    Box(
                        modifier = Modifier
                            .padding(start = 6.dp)
                            .clip(RoundedCornerShape(999.dp))
                            .background(Red)
                            .padding(horizontal = 6.dp, vertical = 2.dp),
                    ) {
                        Text(
                            text = "TODAY",
                            color = Color.White,
                            fontSize = 9.sp,
                            fontWeight = FontWeight.ExtraBold,
                            // The column is fixed width, so without this the pill
                            // broke the word across two lines as "TODA / Y".
                            maxLines = 1,
                            softWrap = false,
                        )
                    }
                }
            }
            Text(
                text = "${day.dayOfMonth}",
                fontSize = 11.5.sp,
                fontWeight = FontWeight.SemiBold,
                color = InkMuted,
            )
        }

        day.meals.forEach { meal ->
            Cell(
                meal = meal,
                booked = state.isBooked(day.mealDate, meal),
                onClick = { viewModel.toggle(day.mealDate, meal) },
                modifier = Modifier.weight(1f),
            )
        }
    }
}

@Composable
private fun Cell(
    meal: MealCellDto,
    booked: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val settled = meal.state == "CONSUMED" || meal.state == "MISSED"
    val interactive = !settled && !meal.locked

    val background = when {
        meal.state == "CONSUMED" -> BlueSurface
        meal.state == "MISSED" -> RedTint
        meal.locked -> MutedDeep
        booked -> Blue
        else -> Color.White
    }

    val glyph = when {
        meal.state == "MISSED" -> "✕"
        meal.state == "CONSUMED" || booked -> "✓"
        meal.locked -> ""
        else -> "+"
    }

    val glyphColor = when {
        meal.state == "CONSUMED" -> BlueMuted
        meal.state == "MISSED" -> RedText
        booked -> Color.White
        else -> InkGhost
    }

    Box(
        modifier = modifier
            .height(50.dp)
            .clip(RoundedCornerShape(14.dp))
            .background(background)
            // Available cells get the dashed-looking hairline the design uses to
            // read as "empty but tappable".
            .then(
                if (!booked && !settled && !meal.locked) {
                    Modifier.border(1.5.dp, LineDashed, RoundedCornerShape(14.dp))
                } else {
                    Modifier
                },
            )
            .clickable(enabled = interactive, onClick = onClick),
        contentAlignment = Alignment.Center,
    ) {
        Text(
            text = glyph,
            color = glyphColor,
            fontSize = if (booked || meal.state == "CONSUMED") 17.sp else 19.sp,
            fontWeight = if (booked) FontWeight.Bold else FontWeight.Normal,
        )
    }
}

@Composable
private fun Legend() {
    Row(horizontalArrangement = Arrangement.spacedBy(14.dp)) {
        LegendItem("Booked", Blue)
        LegendItem("Available", Color.White)
        LegendItem("Locked", MutedDeep)
        LegendItem("Served", BlueSurface)
    }
}

@Composable
private fun LegendItem(label: String, color: Color) {
    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(5.dp)) {
        Box(
            Modifier
                .size(11.dp)
                .clip(RoundedCornerShape(4.dp))
                .background(color)
                // Every swatch is outlined, not just the white one. The pale
                // Locked and Served fills were near-invisible against the canvas,
                // which left half the legend explaining nothing.
                .border(1.5.dp, LineDashed, RoundedCornerShape(4.dp)),
        )
        Text(label, fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = InkMuted)
    }
}

/** Sticky footer: live count and total, plus the single commit action. */
@Composable
private fun ConfirmBar(state: WeekUiState, viewModel: WeekViewModel) {
    KhaiCard(
        modifier = Modifier.fillMaxWidth().padding(16.dp),
        shape = RoundedCornerShape(22.dp),
        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 14.dp),
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Column(Modifier.weight(1f)) {
                Text(
                    text = "${state.selectedCount} meals · ৳${state.selectedTotal.toInt()}",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = Ink,
                )
                Text(
                    text = if (state.hasChanges) "Unsaved changes" else "Charged as due when served",
                    fontSize = 11.5.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = if (state.hasChanges) RedDeep else InkMuted,
                )
            }
            PillButton(
                text = "Confirm",
                onClick = viewModel::confirm,
                enabled = state.hasChanges,
                loading = state.isSaving,
            )
        }
    }
}
