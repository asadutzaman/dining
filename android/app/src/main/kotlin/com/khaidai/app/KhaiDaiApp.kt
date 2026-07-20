package com.khaidai.app

import androidx.compose.animation.AnimatedContentTransitionScope
import androidx.compose.animation.EnterTransition
import androidx.compose.animation.ExitTransition
import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateDpAsState
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavBackStackEntry
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.khaidai.core.designsystem.component.LoadingIndicator
import com.khaidai.core.designsystem.theme.*
import com.khaidai.feature.account.DuesRoute
import com.khaidai.feature.account.ProfileRoute
import com.khaidai.feature.auth.AuthRoute
import com.khaidai.feature.booking.BookingsRoute
import com.khaidai.feature.booking.DayRoute
import com.khaidai.feature.booking.WeekRoute
import com.khaidai.feature.home.HomeRoute
import com.khaidai.feature.home.NotificationsRoute

private object Routes {
    const val AUTH = "auth"
    const val HOME = "home"
    const val WEEK = "week"
    const val BOOKINGS = "bookings"
    const val DUES = "dues"
    const val PROFILE = "profile"
    const val NOTIFICATIONS = "notifications"
    const val DAY = "day"

    fun day(date: String? = null) = if (date == null) "$DAY?date=" else "$DAY?date=$date"
}

/** The five destinations in the bottom bar, in the design's order. */
private enum class Tab(val route: String, val label: String) {
    Home(Routes.HOME, "Home"),
    Week(Routes.WEEK, "Week"),
    Bookings(Routes.BOOKINGS, "Bookings"),
    Dues(Routes.DUES, "Dues"),
    Profile(Routes.PROFILE, "Profile"),
}

private const val SLIDE_MS = 300

private fun tabIndexOf(route: String?): Int = Tab.entries.indexOfFirst { it.route == route }

/**
 * Which way a tab switch travels, or null when either end is not a tab.
 *
 * Direction comes from the tabs' position in the bar, so the content moves the
 * same way the eye does: tapping a tab to the right slides the new screen in
 * from the right. A pushed full-screen destination is not a tab move and gets
 * the standard forward push instead.
 */
private fun AnimatedContentTransitionScope<NavBackStackEntry>.tabTravel(): Int? {
    val from = tabIndexOf(initialState.destination.route)
    val to = tabIndexOf(targetState.destination.route)

    return if (from >= 0 && to >= 0 && from != to) to.compareTo(from) else null
}

private fun AnimatedContentTransitionScope<NavBackStackEntry>.tabEnter(): EnterTransition {
    val travel = tabTravel()
        ?: return slideIntoContainer(
            AnimatedContentTransitionScope.SlideDirection.Start,
            tween(SLIDE_MS),
        ) + fadeIn(tween(SLIDE_MS))

    return slideIntoContainer(
        towards = if (travel > 0) {
            AnimatedContentTransitionScope.SlideDirection.Left
        } else {
            AnimatedContentTransitionScope.SlideDirection.Right
        },
        animationSpec = tween(SLIDE_MS),
    ) + fadeIn(tween(SLIDE_MS))
}

private fun AnimatedContentTransitionScope<NavBackStackEntry>.tabExit(): ExitTransition {
    val travel = tabTravel()
        ?: return slideOutOfContainer(
            AnimatedContentTransitionScope.SlideDirection.Start,
            tween(SLIDE_MS),
        ) + fadeOut(tween(SLIDE_MS))

    return slideOutOfContainer(
        towards = if (travel > 0) {
            AnimatedContentTransitionScope.SlideDirection.Left
        } else {
            AnimatedContentTransitionScope.SlideDirection.Right
        },
        animationSpec = tween(SLIDE_MS),
    ) + fadeOut(tween(SLIDE_MS))
}

@Composable
fun KhaiDaiApp(isSignedIn: Boolean?) {
    // Still reading the stored session: hold the splash rather than guessing,
    // which would flash the wrong screen for a frame.
    if (isSignedIn == null) {
        Box(Modifier.fillMaxSize().background(Canvas), contentAlignment = Alignment.Center) {
            LoadingIndicator()
        }
        return
    }

    val navController = rememberNavController()

    if (!isSignedIn) {
        // A separate graph rather than a route inside the main one: signing out
        // must leave nothing on the back stack to navigate back into.
        NavHost(navController, startDestination = Routes.AUTH) {
            composable(Routes.AUTH) {
                AuthRoute(onSignedIn = { /* session flow re-composes into the main graph */ })
            }
        }
        return
    }

    SignedInScaffold(navController)
}

@Composable
private fun SignedInScaffold(navController: NavHostController) {
    val backStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = backStackEntry?.destination?.route

    // Full-screen destinations opt out of the bottom bar.
    val showBottomBar = Tab.entries.any { it.route == currentRoute }

    Scaffold(
        containerColor = Canvas,
        bottomBar = {
            if (showBottomBar) {
                BottomBar(
                    currentRoute = currentRoute,
                    onSelect = { route ->
                        navController.navigate(route) {
                            // Standard bottom-bar behaviour: one entry per tab,
                            // state preserved when returning to a tab.
                            popUpTo(navController.graph.findStartDestination().id) { saveState = true }
                            launchSingleTop = true
                            restoreState = true
                        }
                    },
                )
            }
        },
    ) { padding ->
        NavHost(
            navController = navController,
            startDestination = Routes.HOME,
            modifier = Modifier.padding(bottom = padding.calculateBottomPadding()),
            enterTransition = { tabEnter() },
            exitTransition = { tabExit() },
            // Going back reverses the push, so a dismissed full-screen destination
            // slides back out the way it came in.
            popEnterTransition = {
                slideIntoContainer(
                    AnimatedContentTransitionScope.SlideDirection.End,
                    tween(SLIDE_MS),
                ) + fadeIn(tween(SLIDE_MS))
            },
            popExitTransition = {
                slideOutOfContainer(
                    AnimatedContentTransitionScope.SlideDirection.End,
                    tween(SLIDE_MS),
                ) + fadeOut(tween(SLIDE_MS))
            },
        ) {
            composable(Routes.HOME) {
                HomeRoute(
                    onOpenNotifications = { navController.navigate(Routes.NOTIFICATIONS) },
                    onOpenWeek = { navController.navigate(Routes.WEEK) },
                    onOpenDay = { date -> navController.navigate(Routes.day(date)) },
                )
            }

            composable(Routes.WEEK) { WeekRoute() }

            composable(Routes.BOOKINGS) { BookingsRoute() }

            composable(Routes.DUES) { DuesRoute() }

            composable(Routes.PROFILE) {
                ProfileRoute(onSignedOut = { /* session flow swaps the graph */ })
            }

            composable(Routes.NOTIFICATIONS) {
                NotificationsRoute(
                    onBack = { navController.popBackStack() },
                    onOpenRoute = { route -> navController.navigate(mapActionRoute(route)) },
                )
            }

            composable(
                route = "${Routes.DAY}?date={date}",
                arguments = listOf(
                    androidx.navigation.navArgument("date") {
                        type = androidx.navigation.NavType.StringType
                        nullable = true
                        defaultValue = null
                    },
                ),
            ) {
                DayRoute(onBack = { navController.popBackStack() })
            }
        }
    }
}

/**
 * Notification deep links are server-authored strings like
 * "booking/2026-07-12/DINNER". Translating them here keeps route syntax out of
 * the API contract, so a navigation change does not require a backend release.
 */
private fun mapActionRoute(actionRoute: String): String = when {
    actionRoute.startsWith("booking/") ->
        Routes.day(actionRoute.split('/').getOrNull(1))

    actionRoute == "week" -> Routes.WEEK
    actionRoute == "bookings" -> Routes.BOOKINGS
    actionRoute == "profile" -> Routes.PROFILE
    else -> Routes.HOME
}

/** Height of a tab's touch target, shared by the label row and the indicator. */
private val TabHeight: Dp = 38.dp

@Composable
private fun BottomBar(currentRoute: String?, onSelect: (String) -> Unit) {
    // An unknown route (a full-screen destination) keeps the last tab highlighted
    // rather than snapping the indicator to Home.
    val selectedIndex = tabIndexOf(currentRoute).coerceAtLeast(0)

    Column {
        Box(Modifier.fillMaxWidth().height(1.dp).background(Line))

        BoxWithConstraints(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color.White)
                .padding(start = 14.dp, end = 14.dp, top = 10.dp, bottom = 24.dp),
        ) {
            val tabWidth = maxWidth / Tab.entries.size

            // A spring rather than a tween: the indicator is chasing the finger,
            // and a little overshoot reads as responsive where linear reads dead.
            val indicatorOffset by animateDpAsState(
                targetValue = tabWidth * selectedIndex,
                animationSpec = spring(
                    dampingRatio = Spring.DampingRatioLowBouncy,
                    stiffness = Spring.StiffnessMediumLow,
                ),
                label = "tabIndicator",
            )

            // Drawn beneath the labels so it slides behind them.
            Box(
                Modifier
                    .offset(x = indicatorOffset)
                    .width(tabWidth)
                    .height(TabHeight)
                    .clip(CircleShape)
                    .background(BlueTint),
            )

            Row(Modifier.fillMaxWidth().height(TabHeight)) {
                Tab.entries.forEachIndexed { index, tab ->
                    val selected = index == selectedIndex

                    // Colour crossfades on the same beat as the slide, so the
                    // label lights up as the pill arrives rather than before it.
                    val labelColor by animateColorAsState(
                        targetValue = if (selected) Blue else InkFaint,
                        animationSpec = tween(SLIDE_MS),
                        label = "tabLabel",
                    )

                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .fillMaxHeight()
                            .clip(CircleShape)
                            .clickable { onSelect(tab.route) },
                        contentAlignment = Alignment.Center,
                    ) {
                        Text(
                            text = tab.label,
                            fontSize = 11.5.sp,
                            fontWeight = if (selected) FontWeight.ExtraBold else FontWeight.SemiBold,
                            color = labelColor,
                            textAlign = TextAlign.Center,
                        )
                    }
                }
            }
        }
    }
}
