package com.khaidai.core.designsystem.theme

import androidx.compose.ui.graphics.Color

/*
 * Palette taken directly from the KhaiDai design. Named by role rather than by
 * hue so a future re-skin changes these values without touching call sites.
 */

val Navy = Color(0xFF17355F)          // headers, dark cards
val NavyDeep = Color(0xFF12264A)      // hero image scrim
val Blue = Color(0xFF2B5CA8)          // primary action, booked state
val BlueTint = Color(0xFFE4EBF7)      // primary chip background
val BlueSurface = Color(0xFFDCE6F3)   // consumed / served state
val BlueMuted = Color(0xFF5B76A3)     // consumed glyph
val BlueDeepText = Color(0xFF35517F)  // text on BlueSurface
val BlueSelected = Color(0xFFEFF3FA)  // selected meal card

val Ink = Color(0xFF1C2230)           // primary text
val InkSoft = Color(0xFF5F6775)       // section headings
val InkMuted = Color(0xFF7C8494)      // captions
val InkFaint = Color(0xFF8D94A3)      // inactive tabs, timestamps
val InkGhost = Color(0xFFA8B2C2)      // empty-cell glyph

val Canvas = Color(0xFFF8FAFC)        // screen background
val Surface = Color(0xFFFFFFFF)       // cards
val Line = Color(0xFFE5E9F0)          // card borders
val LineStrong = Color(0xFFD8DEE8)    // outlined buttons
val LineDashed = Color(0xFFC7CFDC)    // available-cell dashes
val Divider = Color(0xFFEEF1F6)       // list separators
val Muted = Color(0xFFEAEDF3)         // segmented control track
val MutedDeep = Color(0xFFE6EAF0)     // locked cell
val LockedText = Color(0xFF98A1B0)    // locked cell text

val Red = Color(0xFFC2453C)           // live indicator, alerts
val RedDeep = Color(0xFFB03A31)       // urgent captions
val RedText = Color(0xFFB8433A)       // missed / destructive text
val RedTint = Color(0xFFF7E2E0)       // missed chip background
val RedBorder = Color(0xFFF0CBC7)     // cancel button outline

val ChartBar = Color(0xFFC9D6EA)      // past occupancy bar
val ChartForecast = Color(0xFFDCE6F3) // forecast bar
