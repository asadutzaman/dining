package com.khaidai.core.designsystem.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Shapes
import androidx.compose.material3.Typography
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.foundation.shape.RoundedCornerShape

/*
 * The design is a single light theme. Rather than invent a dark palette that was
 * never designed or contrast-checked, the app pins itself to light -- an
 * unreviewed dark mode would be worse than none.
 */
private val KhaiDaiColorScheme = lightColorScheme(
    primary = Blue,
    onPrimary = Surface,
    primaryContainer = BlueTint,
    onPrimaryContainer = Navy,
    secondary = Navy,
    onSecondary = Surface,
    background = Canvas,
    onBackground = Ink,
    surface = Surface,
    onSurface = Ink,
    surfaceVariant = Muted,
    onSurfaceVariant = InkSoft,
    outline = Line,
    outlineVariant = LineStrong,
    error = RedText,
    onError = Surface,
    errorContainer = RedTint,
    onErrorContainer = RedText,
)

/**
 * Bricolage Grotesque and Noto Sans Bengali are not bundled, so the system font
 * is used with the design's weights and sizes preserved. Dropping the fonts in
 * `res/font/` and setting a FontFamily here is the only change needed.
 */
private val KhaiDaiTypography = Typography(
    displaySmall = TextStyle(fontSize = 38.sp, fontWeight = FontWeight.ExtraBold, letterSpacing = (-1.5).sp),
    headlineMedium = TextStyle(fontSize = 25.sp, fontWeight = FontWeight.ExtraBold, letterSpacing = (-0.6).sp),
    headlineSmall = TextStyle(fontSize = 24.sp, fontWeight = FontWeight.ExtraBold, letterSpacing = (-0.6).sp),
    titleLarge = TextStyle(fontSize = 21.sp, fontWeight = FontWeight.ExtraBold, letterSpacing = (-0.4).sp),
    titleMedium = TextStyle(fontSize = 16.sp, fontWeight = FontWeight.Bold),
    titleSmall = TextStyle(fontSize = 15.5.sp, fontWeight = FontWeight.Bold),
    bodyLarge = TextStyle(fontSize = 14.sp, fontWeight = FontWeight.Normal),
    bodyMedium = TextStyle(fontSize = 12.5.sp, fontWeight = FontWeight.Normal),
    bodySmall = TextStyle(fontSize = 11.5.sp, fontWeight = FontWeight.Medium),
    labelLarge = TextStyle(fontSize = 13.sp, fontWeight = FontWeight.ExtraBold),
    labelMedium = TextStyle(fontSize = 12.sp, fontWeight = FontWeight.ExtraBold, letterSpacing = 0.4.sp),
    labelSmall = TextStyle(fontSize = 10.5.sp, fontWeight = FontWeight.ExtraBold, letterSpacing = 1.4.sp),
)

// The design leans on large, soft radii throughout: pills for actions, 20-26dp
// for cards.
private val KhaiDaiShapes = Shapes(
    extraSmall = RoundedCornerShape(9.dp),
    small = RoundedCornerShape(14.dp),
    medium = RoundedCornerShape(20.dp),
    large = RoundedCornerShape(22.dp),
    extraLarge = RoundedCornerShape(26.dp),
)

@Composable
fun KhaiDaiTheme(
    @Suppress("UNUSED_PARAMETER") darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit,
) {
    MaterialTheme(
        colorScheme = KhaiDaiColorScheme,
        typography = KhaiDaiTypography,
        shapes = KhaiDaiShapes,
        content = content,
    )
}
