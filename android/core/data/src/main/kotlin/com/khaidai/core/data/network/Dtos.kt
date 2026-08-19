package com.khaidai.core.data.network

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/*
 * Wire types, one per payload the API returns. Kept separate from the UI models
 * so a server field rename is absorbed in the mapper rather than rippling into
 * every composable.
 */

@Serializable
data class MemberDto(
    val id: Long,
    @SerialName("member_code") val memberCode: String,
    val name: String,
    val initials: String = "",
    @SerialName("member_type") val memberType: String = "",
    val phone: String? = null,
    val email: String? = null,
    @SerialName("class_name") val className: String? = null,
    val section: String? = null,
    @SerialName("roll_no") val rollNo: String? = null,
    val department: String? = null,
    val designation: String? = null,
    val card: CardDto = CardDto(),
    @SerialName("due_balance") val dueBalance: Double = 0.0,
    val preferences: PreferencesDto = PreferencesDto(),
)

@Serializable
data class CardDto(
    val linked: Boolean = false,
    @SerialName("masked_number") val maskedNumber: String? = null,
)

@Serializable
data class PreferencesDto(
    val language: String = "en",
    @SerialName("notify_booking_reminder") val bookingReminder: Boolean = true,
    @SerialName("notify_cutoff_warning") val cutoffWarning: Boolean = true,
    @SerialName("notify_weekly_summary") val weeklySummary: Boolean = false,
)

/** One (day, meal) cell of the booking grid. */
@Serializable
data class MealCellDto(
    @SerialName("meal_type") val mealType: String,
    val price: Double = 0.0,
    val state: String = "AVAILABLE",
    val locked: Boolean = false,
    @SerialName("can_book") val canBook: Boolean = false,
    @SerialName("can_cancel") val canCancel: Boolean = false,
    @SerialName("cutoff_at") val cutoffAt: String? = null,
    @SerialName("cutoff_label") val cutoffLabel: String? = null,
    @SerialName("serving_from") val servingFrom: String? = null,
    @SerialName("serving_to") val servingTo: String? = null,
    @SerialName("token_number") val tokenNumber: String? = null,
    @SerialName("consumed_at") val consumedAt: String? = null,
    @SerialName("charge_status") val chargeStatus: String? = null,
    @SerialName("charged_amount") val chargedAmount: Double = 0.0,
)

@Serializable
data class DayPlanDto(
    @SerialName("meal_date") val mealDate: String,
    @SerialName("day_short") val dayShort: String = "",
    @SerialName("day_full") val dayFull: String = "",
    @SerialName("day_of_month") val dayOfMonth: Int = 0,
    @SerialName("is_today") val isToday: Boolean = false,
    @SerialName("booked_count") val bookedCount: Int = 0,
    @SerialName("day_total") val dayTotal: Double = 0.0,
    val meals: List<MealCellDto> = emptyList(),
)

@Serializable
data class PlanDto(
    val from: String = "",
    val to: String = "",
    val days: List<DayPlanDto> = emptyList(),
    val totals: TotalsDto = TotalsDto(),
)

@Serializable
data class TotalsDto(
    val meals: Int = 0,
    val amount: Double = 0.0,
)

@Serializable
data class SuggestedDayDto(
    @SerialName("meal_date") val mealDate: String,
    @SerialName("meal_types") val mealTypes: List<String> = emptyList(),
)

@Serializable
data class SuggestionDto(
    val from: String = "",
    val to: String = "",
    val days: List<SuggestedDayDto> = emptyList(),
)

/* ---- home ---- */

@Serializable
data class HomeDto(
    val greeting: GreetingDto,
    @SerialName("now_serving") val nowServing: NowServingDto? = null,
    val occupancy: OccupancyDto = OccupancyDto(),
    val today: DayPlanDto,
    val tomorrow: TomorrowDto,
    @SerialName("unread_notifications") val unreadNotifications: Int = 0,
    @SerialName("due_balance") val dueBalance: Double = 0.0,
)

@Serializable
data class GreetingDto(
    val salutation: String = "",
    val name: String = "",
    val initials: String = "",
    val date: String = "",
    @SerialName("date_label") val dateLabel: String = "",
)

@Serializable
data class NowServingDto(
    @SerialName("meal_type") val mealType: String,
    // True while the meal is actually being served; false when this is an
    // announcement of the next sitting.
    @SerialName("is_live") val isLive: Boolean = true,
    @SerialName("meal_date") val mealDate: String? = null,
    val until: String? = null,
    @SerialName("until_label") val untilLabel: String? = null,
    @SerialName("starts_at") val startsAt: String? = null,
    @SerialName("starts_at_label") val startsAtLabel: String? = null,
    val cost: Double = 0.0,
    val state: String? = null,
    @SerialName("is_booked") val isBooked: Boolean = false,
)

@Serializable
data class OccupancyDto(
    @SerialName("meal_type") val mealType: String? = null,
    val level: String = "CLOSED",
    // False between meals: the bars are then the usual pattern for the next
    // sitting rather than live card scans.
    @SerialName("is_live") val isLive: Boolean = true,
    @SerialName("meal_date") val mealDate: String? = null,
    @SerialName("wait_minutes") val waitMinutes: Int? = null,
    @SerialName("window_from") val windowFrom: String? = null,
    @SerialName("window_to") val windowTo: String? = null,
    val buckets: List<BucketDto> = emptyList(),
)

@Serializable
data class BucketDto(
    val label: String = "",
    val time: String = "",
    val count: Int = 0,
    val forecast: Double = 0.0,
    val intensity: Double = 0.0,
    @SerialName("is_past") val isPast: Boolean = false,
    @SerialName("is_now") val isNow: Boolean = false,
)

@Serializable
data class TomorrowDto(
    @SerialName("meal_date") val mealDate: String = "",
    @SerialName("day_full") val dayFull: String = "",
    @SerialName("booked_count") val bookedCount: Int = 0,
    @SerialName("day_total") val dayTotal: Double = 0.0,
    @SerialName("is_empty") val isEmpty: Boolean = true,
)

/* ---- bookings list ---- */

@Serializable
data class BookingGroupDto(
    @SerialName("meal_date") val mealDate: String,
    val label: String = "",
    @SerialName("is_today") val isToday: Boolean = false,
    val total: Double = 0.0,
    val bookings: List<BookingDto> = emptyList(),
)

@Serializable
data class BookingDto(
    val id: Long,
    @SerialName("meal_date") val mealDate: String,
    @SerialName("meal_type") val mealType: String,
    @SerialName("unit_price") val unitPrice: Double = 0.0,
    @SerialName("booking_status") val bookingStatus: String = "BOOKED",
    @SerialName("charge_status") val chargeStatus: String? = null,
    @SerialName("charged_amount") val chargedAmount: Double = 0.0,
    @SerialName("cutoff_at") val cutoffAt: String? = null,
    @SerialName("can_cancel") val canCancel: Boolean = false,
    val locked: Boolean = false,
    @SerialName("token_number") val tokenNumber: String? = null,
    @SerialName("consumed_at") val consumedAt: String? = null,
)

/* ---- dues ---- */

@Serializable
data class DuesDto(
    @SerialName("current_due") val currentDue: Double = 0.0,
    val month: MonthDto = MonthDto(),
    val summary: DuesSummaryDto = DuesSummaryDto(),
    @SerialName("by_meal_type") val byMealType: List<MealTypeTotalDto> = emptyList(),
    val payments: List<PaymentDto> = emptyList(),
    val months: List<MonthChipDto> = emptyList(),
)

@Serializable
data class MonthDto(
    val value: String = "",
    val label: String = "",
    val from: String = "",
    val to: String = "",
)

@Serializable
data class DuesSummaryDto(
    val meals: Int = 0,
    val amount: Double = 0.0,
    @SerialName("since_label") val sinceLabel: String = "",
)

@Serializable
data class MealTypeTotalDto(
    @SerialName("meal_type") val mealType: String,
    val label: String = "",
    val count: Int = 0,
    val amount: Double = 0.0,
)

@Serializable
data class PaymentDto(
    val id: Long,
    @SerialName("payment_number") val paymentNumber: String? = null,
    val amount: Double = 0.0,
    @SerialName("payment_date") val paymentDate: String? = null,
    @SerialName("payment_method") val paymentMethod: String? = null,
    val remarks: String? = null,
)

@Serializable
data class MonthChipDto(
    val value: String,
    val label: String,
    val selected: Boolean = false,
)

@Serializable
data class ChargeDto(
    val id: Long,
    val title: String = "",
    val caption: String? = null,
    @SerialName("meal_date") val mealDate: String = "",
    @SerialName("meal_type") val mealType: String = "",
    @SerialName("booking_status") val bookingStatus: String = "",
    @SerialName("charge_status") val chargeStatus: String = "",
    @SerialName("original_price") val originalPrice: Double = 0.0,
    @SerialName("charged_amount") val chargedAmount: Double = 0.0,
)

/* ---- notifications ---- */

@Serializable
data class NotificationFeedDto(
    @SerialName("unread_count") val unreadCount: Int = 0,
    val sections: List<NotificationSectionDto> = emptyList(),
)

@Serializable
data class NotificationSectionDto(
    val date: String = "",
    val label: String = "",
    val items: List<NotificationDto> = emptyList(),
)

@Serializable
data class NotificationDto(
    val id: Long,
    val type: String = "",
    val title: String = "",
    val body: String = "",
    @SerialName("action_route") val actionRoute: String? = null,
    @SerialName("is_read") val isRead: Boolean = false,
    @SerialName("created_at") val createdAt: String = "",
    @SerialName("time_label") val timeLabel: String = "",
)

/* ---- request bodies ---- */

@Serializable
data class RequestOtpBody(val phone: String)

@Serializable
data class VerifyOtpBody(
    val phone: String,
    val code: String,
    @SerialName("device_id") val deviceId: String? = null,
    @SerialName("device_model") val deviceModel: String? = null,
    val platform: String = "ANDROID",
    @SerialName("app_version") val appVersion: String? = null,
)

@Serializable
data class BookingBody(
    @SerialName("meal_date") val mealDate: String,
    @SerialName("meal_type") val mealType: String,
)

@Serializable
data class SyncDayBody(
    @SerialName("meal_date") val mealDate: String,
    @SerialName("meal_types") val mealTypes: List<String>,
)

@Serializable
data class SyncWeekBody(val days: List<SyncDayBody>)

@Serializable
data class PreferencesBody(
    val language: String? = null,
    @SerialName("notify_booking_reminder") val bookingReminder: Boolean? = null,
    @SerialName("notify_cutoff_warning") val cutoffWarning: Boolean? = null,
    @SerialName("notify_weekly_summary") val weeklySummary: Boolean? = null,
)

@Serializable
data class ReportCardBody(
    val reason: String,
    val note: String? = null,
)

@Serializable
data class SyncOutcomeDto(
    val outcome: OutcomeCountsDto = OutcomeCountsDto(),
    val days: List<DayPlanDto> = emptyList(),
    val totals: TotalsDto = TotalsDto(),
    val day: DayPlanDto? = null,
)

@Serializable
data class OutcomeCountsDto(
    val booked: Int = 0,
    val cancelled: Int = 0,
)
