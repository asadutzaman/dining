package com.khaidai.feature.home

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
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
import androidx.compose.ui.BiasAlignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.khaidai.core.data.network.DayPlanDto
import com.khaidai.core.data.network.HomeDto
import com.khaidai.core.data.network.MealCellDto
import com.khaidai.core.data.network.NowServingDto
import com.khaidai.core.data.network.OccupancyDto
import com.khaidai.core.designsystem.component.*
import com.khaidai.core.designsystem.theme.*

@Composable
fun HomeRoute(
    onOpenNotifications: () -> Unit,
    onOpenWeek: () -> Unit,
    onOpenDay: (String) -> Unit,
    viewModel: HomeViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Canvas)
            .verticalScroll(rememberScrollState()),
    ) {
        when {
            state.isInitialLoading -> LoadingIndicator(Modifier.padding(top = 120.dp))

            state.content != null -> HomeContent(
                home = state.content!!,
                error = state.error,
                onDismissError = viewModel::dismissError,
                onOpenNotifications = onOpenNotifications,
                onOpenWeek = onOpenWeek,
                onOpenDay = onOpenDay,
                onBook = viewModel::book,
            )

            else -> CenteredMessage(
                text = state.error ?: "Couldn't load today's meals.",
                modifier = Modifier.padding(top = 120.dp),
            )
        }
    }
}

@Composable
private fun HomeContent(
    home: HomeDto,
    error: String?,
    onDismissError: () -> Unit,
    onOpenNotifications: () -> Unit,
    onOpenWeek: () -> Unit,
    onOpenDay: (String) -> Unit,
    onBook: (String, String) -> Unit,
) {
    Header(home, onOpenNotifications)

    Column(Modifier.padding(horizontal = 24.dp)) {
        if (error != null) {
            Spacer(Modifier.height(14.dp))
            ErrorBanner(message = error, onDismiss = onDismissError)
        }

        Spacer(Modifier.height(18.dp))
        OccupancyCard(home.occupancy)

        Spacer(Modifier.height(20.dp))
        SectionHeader("Today's meals")
        Spacer(Modifier.height(10.dp))

        home.today.meals.forEach { meal ->
            MealRow(
                meal = meal,
                mealDate = home.today.mealDate,
                onBook = onBook,
                modifier = Modifier.padding(bottom = 10.dp),
            )
        }

        Spacer(Modifier.height(8.dp))
        TomorrowCard(home, onOpenWeek, onOpenDay)
        Spacer(Modifier.height(28.dp))
    }
}

/**
 * The hero: the campus photo under the design's navy scrim.
 *
 * The scrim is not decoration -- it is what makes the white greeting and the
 * status bar readable over an arbitrary photo. Its three stops are taken
 * verbatim from the design (dark at top, lifting through the middle, dark
 * again at the bottom behind the "now serving" card).
 */
@Composable
private fun Header(home: HomeDto, onOpenNotifications: () -> Unit) {
    Box(
        Modifier
            .fillMaxWidth()
            // The hero is ~26% of the frame in the design. A floor keeps the photo
            // reading as a hero rather than a stripe if the banner is ever absent
            // (no meal configured at all), instead of letting it collapse to the
            // height of the greeting.
            .heightIn(min = 232.dp),
    ) {
        Image(
            painter = painterResource(R.drawable.campus),
            // Decorative: it carries no information the labels do not already give.
            contentDescription = null,
            contentScale = ContentScale.Crop,
            // The design anchors the photo at "center 32%", keeping the building
            // in frame as the header's height changes.
            alignment = BiasAlignment(horizontalBias = 0f, verticalBias = -0.36f),
            modifier = Modifier.matchParentSize(),
        )

        Box(
            Modifier
                .matchParentSize()
                .background(
                    Brush.verticalGradient(
                        0.00f to NavyDeep.copy(alpha = 0.78f),
                        0.52f to NavyDeep.copy(alpha = 0.40f),
                        1.00f to NavyDeep.copy(alpha = 0.82f),
                    ),
                ),
        )

        HeaderContent(home, onOpenNotifications)
    }
}

@Composable
private fun HeaderContent(home: HomeDto, onOpenNotifications: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(start = 24.dp, end = 24.dp, top = 56.dp, bottom = 20.dp),
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Column(Modifier.weight(1f)) {
                Text(
                    text = home.greeting.dateLabel,
                    fontSize = 12.5.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White.copy(alpha = 0.88f),
                )
                Text(
                    text = "${home.greeting.salutation}, ${home.greeting.name}",
                    style = MaterialTheme.typography.headlineMedium,
                    color = Color.White,
                    modifier = Modifier.padding(top = 2.dp),
                )
            }

            Box {
                Box(
                    modifier = Modifier
                        .size(46.dp)
                        .clip(CircleShape)
                        .background(Color.White)
                        .clickable(onClick = onOpenNotifications),
                    contentAlignment = Alignment.Center,
                ) {
                    Text(
                        text = home.greeting.initials,
                        color = Blue,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.ExtraBold,
                    )
                }
                if (home.unreadNotifications > 0) {
                    Box(
                        modifier = Modifier
                            .size(13.dp)
                            .align(Alignment.TopEnd)
                            .clip(CircleShape)
                            .background(Red),
                    )
                }
            }
        }

        home.nowServing?.let {
            Spacer(Modifier.height(22.dp))
            NowServingBanner(it)
        }
    }
}

@Composable
private fun NowServingBanner(nowServing: NowServingDto) {
    val live = nowServing.isLive
    val meal = nowServing.mealType.lowercase().replaceFirstChar(Char::uppercase)

    KhaiCard(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
        borderColor = Color.White,
        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 14.dp),
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            // The red dot means "food is going out now". A future sitting gets a
            // calm blue one so the urgency cue is not spent on something hours away.
            Box(Modifier.size(10.dp).clip(CircleShape).background(if (live) Red else Blue))

            Column(Modifier.weight(1f).padding(start = 12.dp)) {
                Text(
                    text = if (live) "NOW SERVING" else "NEXT SERVING",
                    style = MaterialTheme.typography.labelSmall,
                    color = if (live) RedDeep else Blue,
                )
                Text(
                    text = buildString {
                        append(meal)
                        if (live) {
                            nowServing.untilLabel?.let { append(" · until $it") }
                        } else {
                            nowServing.startsAtLabel?.let { append(" · from $it") }
                        }
                    },
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    color = Ink,
                )
            }

            if (nowServing.isBooked) {
                StatusChip("You're booked ✓", BlueTint, Blue)
            }
        }
    }
}

/**
 * The occupancy chart. Solid bars are scans that already happened; the pale ones
 * ahead of now are the forecast, and the current bucket is called out in red --
 * exactly the reading order the design uses.
 */
@Composable
private fun OccupancyCard(occupancy: OccupancyDto) {
    if (occupancy.buckets.isEmpty()) return

    KhaiCard(modifier = Modifier.fillMaxWidth()) {
        Column {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text = "How busy is the hall?",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = Ink,
                    modifier = Modifier.weight(1f),
                )
                val (label, bg, fg) = when {
                    // Between meals the chart is a forecast, so the chip says
                    // when the hall opens instead of claiming a live reading.
                    !occupancy.isLive -> Triple(
                        occupancy.windowFrom
                            ?.let { "Closed · opens ${formatTime(it)}" }
                            ?: "Closed",
                        Muted,
                        InkFaint,
                    )
                    occupancy.level == "BUSY" -> Triple(
                        "Busy now" + (occupancy.waitMinutes?.let { " · ~$it min wait" } ?: ""),
                        RedTint,
                        RedText,
                    )
                    occupancy.level == "MODERATE" -> Triple("Filling up", BlueTint, Blue)
                    occupancy.level == "QUIET" -> Triple("Quiet now", BlueSurface, BlueDeepText)
                    else -> Triple("Closed", Muted, InkFaint)
                }
                StatusChip(label, bg, fg)
            }

            Spacer(Modifier.height(14.dp))

            Row(
                modifier = Modifier.fillMaxWidth().height(64.dp),
                horizontalArrangement = Arrangement.spacedBy(6.dp),
                verticalAlignment = Alignment.Bottom,
            ) {
                occupancy.buckets.forEach { bucket ->
                    val fraction = bucket.intensity.coerceIn(0.08, 1.0).toFloat()
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .fillMaxHeight(fraction)
                            .clip(RoundedCornerShape(topStart = 6.dp, topEnd = 6.dp, bottomStart = 3.dp, bottomEnd = 3.dp))
                            .background(
                                when {
                                    bucket.isNow -> Red
                                    bucket.isPast -> ChartBar
                                    else -> ChartForecast
                                },
                            ),
                    )
                }
            }

            Spacer(Modifier.height(6.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(6.dp),
            ) {
                occupancy.buckets.forEach { bucket ->
                    Text(
                        text = if (bucket.isNow) "Now" else bucket.label,
                        modifier = Modifier.weight(1f),
                        fontSize = 9.5.sp,
                        fontWeight = if (bucket.isNow) FontWeight.ExtraBold else FontWeight.Medium,
                        color = if (bucket.isNow) RedText else InkFaint,
                        textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                    )
                }
            }

            Text(
                text = if (occupancy.isLive) {
                    "Live from card scans · lighter bars are the usual forecast"
                } else {
                    val meal = occupancy.mealType?.lowercase() ?: "the next meal"
                    "Usual pattern for $meal · no one is being served right now"
                },
                fontSize = 11.sp,
                fontWeight = FontWeight.Medium,
                color = InkMuted,
                modifier = Modifier.padding(top = 10.dp),
            )
        }
    }
}

/**
 * One meal on the home screen. The server already decided whether this cell can
 * be booked, so the row renders that decision rather than recomputing cutoffs.
 */
@Composable
internal fun MealRow(
    meal: MealCellDto,
    mealDate: String,
    onBook: (String, String) -> Unit,
    modifier: Modifier = Modifier,
) {
    val name = meal.mealType.lowercase().replaceFirstChar(Char::uppercase)

    val (boxColor, boxContent, boxText) = when (meal.state) {
        "CONSUMED" -> Triple(BlueSurface, "✓", BlueMuted)
        "BOOKED" -> Triple(Blue, "✓", Color.White)
        "MISSED" -> Triple(RedTint, "✕", RedText)
        else -> if (meal.locked) Triple(MutedDeep, "✕", LockedText) else Triple(Color.White, "+", InkGhost)
    }

    KhaiCard(
        modifier = modifier.fillMaxWidth(),
        borderColor = if (meal.state == "BOOKED") Blue else Line,
        background = if (meal.locked && meal.state == "AVAILABLE") MutedDeep.copy(alpha = 0.45f) else Color.White,
        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 15.dp),
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier
                    .size(42.dp)
                    .clip(RoundedCornerShape(14.dp))
                    .background(boxColor),
                contentAlignment = Alignment.Center,
            ) {
                Text(boxContent, color = boxText, fontSize = 17.sp, fontWeight = FontWeight.ExtraBold)
            }

            Column(Modifier.weight(1f).padding(start = 14.dp)) {
                Text(
                    text = name,
                    fontSize = 15.5.sp,
                    fontWeight = FontWeight.Bold,
                    color = if (meal.locked && meal.state == "AVAILABLE") InkMuted else Ink,
                )
                Text(
                    text = caption(meal),
                    fontSize = 12.5.sp,
                    fontWeight = if (meal.state == "BOOKED") FontWeight.SemiBold else FontWeight.Normal,
                    color = when {
                        meal.state == "BOOKED" -> RedDeep
                        meal.locked -> RedText
                        else -> InkMuted
                    },
                    modifier = Modifier.padding(top = 2.dp),
                )
            }

            when {
                meal.state == "CONSUMED" -> StatusChip("Consumed", BlueSurface, BlueDeepText)
                meal.state == "BOOKED" -> StatusChip("Booked", BlueTint, Blue)
                meal.state == "MISSED" -> StatusChip("Missed", RedTint, RedText)
                meal.canBook -> PillButton(
                    text = "Book · ৳${meal.price.toInt()}",
                    onClick = { onBook(mealDate, meal.mealType) },
                )
                else -> StatusChip("Locked", MutedDeep, LockedText)
            }
        }
    }
}

/** "19:00:00" -> "7:00 PM". The API sends times as plain SQL time strings. */
private fun formatTime(raw: String): String {
    val parts = raw.split(':')
    val hour = parts.getOrNull(0)?.toIntOrNull() ?: return raw
    val minute = parts.getOrNull(1) ?: "00"

    val display = when {
        hour == 0 -> 12
        hour > 12 -> hour - 12
        else -> hour
    }

    return "$display:$minute ${if (hour < 12) "AM" else "PM"}"
}

private fun caption(meal: MealCellDto): String = when {
    meal.state == "CONSUMED" ->
        listOfNotNull(
            meal.consumedAt?.substringAfter(' ')?.take(5)?.let { "Served $it" },
            "৳${meal.price.toInt()}",
        ).joinToString(" · ")

    meal.state == "BOOKED" && !meal.locked -> "Serving soon — scan your card at the counter"
    meal.state == "BOOKED" -> "Booked · ৳${meal.price.toInt()}"
    meal.state == "MISSED" -> "Not scanned — still charged"
    else -> meal.cutoffLabel ?: "৳${meal.price.toInt()}"
}

@Composable
private fun TomorrowCard(home: HomeDto, onOpenWeek: () -> Unit, onOpenDay: (String) -> Unit) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(24.dp))
            .background(Navy)
            .padding(18.dp),
    ) {
        Column {
            Text(
                text = if (home.tomorrow.isEmpty) "Tomorrow is empty" else "Tomorrow is set",
                fontSize = 16.sp,
                fontWeight = FontWeight.ExtraBold,
                color = Color.White,
            )
            Text(
                text = if (home.tomorrow.isEmpty) {
                    "Nothing booked for ${home.tomorrow.dayFull} yet. Kitchen counts close at each cutoff."
                } else {
                    "${home.tomorrow.bookedCount} meal(s) booked for ${home.tomorrow.dayFull} · ৳${home.tomorrow.dayTotal.toInt()}."
                },
                fontSize = 13.sp,
                color = Color.White.copy(alpha = 0.78f),
                modifier = Modifier.padding(top = 3.dp),
            )

            Row(
                modifier = Modifier.padding(top = 14.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                Box(
                    modifier = Modifier
                        .clip(CircleShape)
                        .background(Color.White)
                        .clickable { onOpenDay(home.tomorrow.mealDate) }
                        .padding(horizontal = 16.dp, vertical = 11.dp),
                ) {
                    Text("Book tomorrow", color = Navy, fontSize = 13.sp, fontWeight = FontWeight.ExtraBold)
                }
                Box(
                    modifier = Modifier
                        .clip(CircleShape)
                        .background(Color.White.copy(alpha = 0.14f))
                        .clickable(onClick = onOpenWeek)
                        .padding(horizontal = 16.dp, vertical = 11.dp),
                ) {
                    Text("Plan my week →", color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}
