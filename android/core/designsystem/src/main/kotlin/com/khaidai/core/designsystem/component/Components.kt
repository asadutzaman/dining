package com.khaidai.core.designsystem.component

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.asPaddingValues
import androidx.compose.foundation.layout.calculateEndPadding
import androidx.compose.foundation.layout.calculateStartPadding
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.navigationBars
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.ArrowBack
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.khaidai.core.designsystem.theme.Ink
import com.khaidai.core.designsystem.theme.InkFaint
import com.khaidai.core.designsystem.theme.InkMuted
import com.khaidai.core.designsystem.theme.InkSoft
import com.khaidai.core.designsystem.theme.Line
import com.khaidai.core.designsystem.theme.LineStrong
import com.khaidai.core.designsystem.theme.RedText
import com.khaidai.core.designsystem.theme.RedTint

/**
 * Adds the system navigation bar inset to a scrolling list's content padding.
 *
 * For screens with the bottom bar the Scaffold already handles this, but a
 * pushed full-screen destination has no bar to measure, so without this its last
 * row scrolls to rest underneath the system navigation.
 */
@Composable
fun PaddingValues.plusNavigationBars(): PaddingValues {
    val direction = LocalLayoutDirection.current
    val navBars = WindowInsets.navigationBars.asPaddingValues().calculateBottomPadding()

    return PaddingValues(
        start = calculateStartPadding(direction),
        top = calculateTopPadding(),
        end = calculateEndPadding(direction),
        bottom = calculateBottomPadding() + navBars,
    )
}

/** The design's white card: soft radius, hairline border, no elevation. */
@Composable
fun KhaiCard(
    modifier: Modifier = Modifier,
    borderColor: Color = Line,
    background: Color = MaterialTheme.colorScheme.surface,
    shape: RoundedCornerShape = RoundedCornerShape(20.dp),
    contentPadding: PaddingValues = PaddingValues(16.dp),
    content: @Composable () -> Unit,
) {
    Box(
        modifier = modifier
            .clip(shape)
            .background(background)
            .border(1.5.dp, borderColor, shape)
            .padding(contentPadding),
    ) { content() }
}

/** Filled pill -- the primary action everywhere in the design. */
@Composable
fun PillButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    loading: Boolean = false,
) {
    Button(
        onClick = onClick,
        modifier = modifier,
        enabled = enabled && !loading,
        shape = CircleShape,
        contentPadding = PaddingValues(horizontal = 22.dp, vertical = 13.dp),
        colors = ButtonDefaults.buttonColors(
            containerColor = MaterialTheme.colorScheme.primary,
            contentColor = MaterialTheme.colorScheme.onPrimary,
        ),
    ) {
        if (loading) {
            CircularProgressIndicator(
                modifier = Modifier.size(16.dp),
                strokeWidth = 2.dp,
                color = MaterialTheme.colorScheme.onPrimary,
            )
        } else {
            Text(text, fontSize = 14.sp, fontWeight = FontWeight.ExtraBold)
        }
    }
}

/** Outlined pill -- "Clear", "Dismiss" and other secondary actions. */
@Composable
fun GhostPillButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    contentColor: Color = InkFaint,
    borderColor: Color = LineStrong,
    enabled: Boolean = true,
) {
    OutlinedButton(
        onClick = onClick,
        modifier = modifier,
        enabled = enabled,
        shape = CircleShape,
        border = BorderStroke(1.5.dp, borderColor),
        contentPadding = PaddingValues(horizontal = 15.dp, vertical = 10.dp),
        colors = ButtonDefaults.outlinedButtonColors(contentColor = contentColor),
    ) {
        Text(text, fontSize = 12.5.sp, fontWeight = FontWeight.Bold)
    }
}

/** The small rounded status pill: "Booked", "Consumed", "Missed", "Locked". */
@Composable
fun StatusChip(
    text: String,
    background: Color,
    contentColor: Color,
    modifier: Modifier = Modifier,
) {
    Surface(
        modifier = modifier,
        shape = CircleShape,
        color = background,
    ) {
        Text(
            text = text,
            color = contentColor,
            fontSize = 11.5.sp,
            fontWeight = FontWeight.ExtraBold,
            modifier = Modifier.padding(horizontal = 11.dp, vertical = 6.dp),
        )
    }
}

/**
 * The title block every screen opens with: an optional back arrow, the English
 * title, its Bengali counterpart, and an optional trailing action.
 *
 * Screens used to hand-roll this, which is how they drifted apart -- one used
 * `titleLarge` where the rest used `headlineSmall`, one had a back arrow and the
 * other pushed screen had none, and each guessed a 56dp spacer for the status
 * bar. The inset is measured here instead, so the header sits correctly on a
 * device whose status bar is not the height that guess assumed.
 */
@Composable
fun ScreenHeader(
    title: String,
    modifier: Modifier = Modifier,
    subtitle: String? = null,
    onBack: (() -> Unit)? = null,
    action: @Composable (() -> Unit)? = null,
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .statusBarsPadding()
            .padding(top = 18.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        if (onBack != null) {
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .clip(CircleShape)
                    .background(Color.White)
                    .border(1.5.dp, Line, CircleShape)
                    .clickable(role = Role.Button, onClick = onBack)
                    .padding(9.dp),
            ) {
                Icon(
                    imageVector = Icons.AutoMirrored.Rounded.ArrowBack,
                    contentDescription = "Back",
                    tint = Ink,
                )
            }
        }

        Column(
            Modifier
                .weight(1f)
                .padding(start = if (onBack != null) 12.dp else 0.dp),
        ) {
            Text(title, style = MaterialTheme.typography.headlineSmall, color = Ink)
            if (subtitle != null) {
                Text(
                    text = subtitle,
                    fontSize = 12.5.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = InkMuted,
                    modifier = Modifier.padding(top = 2.dp),
                )
            }
        }

        action?.invoke()
    }
}

/** Uppercase section heading: "TODAY'S MEALS", "RECENT CHARGES". */
@Composable
fun SectionHeader(text: String, modifier: Modifier = Modifier) {
    Text(
        text = text.uppercase(),
        style = MaterialTheme.typography.labelMedium,
        color = InkSoft,
        modifier = modifier,
    )
}

/**
 * Failure banner. Shown above content rather than replacing it, so a refresh
 * that fails never wipes what the member was already looking at.
 */
@Composable
fun ErrorBanner(
    message: String?,
    modifier: Modifier = Modifier,
    onDismiss: (() -> Unit)? = null,
) {
    AnimatedVisibility(visible = message != null, modifier = modifier) {
        KhaiCard(
            modifier = Modifier.fillMaxWidth(),
            borderColor = RedTint,
            background = RedTint,
            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 12.dp),
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text = message.orEmpty(),
                    color = RedText,
                    fontSize = 12.5.sp,
                    fontWeight = FontWeight.SemiBold,
                    modifier = Modifier.weight(1f),
                )
                if (onDismiss != null) {
                    Text(
                        text = "Dismiss",
                        color = RedText,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.ExtraBold,
                        modifier = Modifier
                            .padding(start = 12.dp)
                            .clip(CircleShape)
                            .clickable(role = Role.Button, onClick = onDismiss)
                            // Padding inside the click target, so the 12sp label
                            // is not the whole of what a thumb has to hit.
                            .padding(horizontal = 10.dp, vertical = 8.dp),
                    )
                }
            }
        }
    }
}

/** Centred empty/loading message used by the list screens. */
@Composable
fun CenteredMessage(text: String, modifier: Modifier = Modifier) {
    Column(
        modifier = modifier.fillMaxWidth().padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Text(
            text = text,
            color = InkFaint,
            fontSize = 13.sp,
            fontWeight = FontWeight.Medium,
            textAlign = TextAlign.Center,
        )
    }
}

@Composable
fun LoadingIndicator(modifier: Modifier = Modifier) {
    Box(modifier = modifier.fillMaxWidth().padding(32.dp), contentAlignment = Alignment.Center) {
        CircularProgressIndicator(strokeWidth = 2.5.dp, color = MaterialTheme.colorScheme.primary)
    }
}
