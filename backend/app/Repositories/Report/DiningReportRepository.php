<?php

namespace App\Repositories\Report;

use App\Repositories\BaseRepository;
use App\Models\Dining\Member;
use App\Models\Dining\MealToken;
use App\Models\Dining\Payment;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DiningReportRepository extends BaseRepository
{
    protected $request;

    public function init()
    {
        $this->request = request();
        return $this;
    }

    // Per-member summary for a given month: tokens issued, paid/due totals, payments collected
    public function getMonthlySummary($year, $month)
    {
        $start = Carbon::createFromDate($year, $month, 1)->startOfMonth()->format('Y-m-d');
        $end = Carbon::createFromDate($year, $month, 1)->endOfMonth()->format('Y-m-d');

        $tokenStats = MealToken::query()
            ->select(
                'member_id',
                DB::raw('COUNT(*) as tokens_count'),
                DB::raw("SUM(amount) as total_amount"),
                DB::raw("SUM(CASE WHEN payment_status = 'PAID' THEN amount ELSE 0 END) as paid_amount"),
                DB::raw("SUM(CASE WHEN payment_status = 'DUE' THEN amount ELSE 0 END) as due_amount")
            )
            ->whereBetween('meal_date', [$start, $end])
            ->groupBy('member_id')
            ->get()
            ->keyBy('member_id');

        $paymentStats = Payment::query()
            ->select('member_id', DB::raw('SUM(amount) as payments_collected'))
            ->whereBetween('payment_date', [$start, $end])
            ->groupBy('member_id')
            ->get()
            ->keyBy('member_id');

        $members = Member::query()
            ->select('id', 'member_code', 'name', 'member_type', 'due_balance')
            ->where('status', 1)
            ->orderBy('name')
            ->get();

        $results = $members->map(function ($member) use ($tokenStats, $paymentStats) {
            $tokenStat = $tokenStats->get($member->id);
            $paymentStat = $paymentStats->get($member->id);

            return [
                'member_id'          => $member->id,
                'member_code'        => $member->member_code,
                'member_name'        => $member->name,
                'member_type'        => $member->member_type,
                'tokens_count'       => $tokenStat->tokens_count ?? 0,
                'total_amount'       => (float) ($tokenStat->total_amount ?? 0),
                'paid_amount'        => (float) ($tokenStat->paid_amount ?? 0),
                'due_amount'         => (float) ($tokenStat->due_amount ?? 0),
                'payments_collected' => (float) ($paymentStat->payments_collected ?? 0),
                'current_due_balance' => (float) $member->due_balance,
            ];
        })->filter(function ($row) {
            // Only include members with activity this month
            return $row['tokens_count'] > 0 || $row['payments_collected'] > 0;
        })->values();

        return $results;
    }

    // Ledger statement (tokens + payments) for one member within a date range
    public function getIndividualStatement($memberId, $from, $to)
    {
        $tokens = MealToken::query()
            ->where('member_id', $memberId)
            ->whereBetween('meal_date', [$from, $to])
            ->orderBy('meal_date')
            ->get()
            ->map(function ($token) {
                return [
                    'date'        => $token->meal_date->format('Y-m-d'),
                    'entry_type'  => 'TOKEN',
                    'description' => "{$token->meal_type} meal ({$token->token_number}) - {$token->payment_status}",
                    'due_added'   => $token->payment_status == 'DUE' ? (float) $token->amount : 0,
                    'paid_amount' => $token->payment_status == 'PAID' ? (float) $token->amount : 0,
                ];
            });

        $payments = Payment::query()
            ->where('member_id', $memberId)
            ->whereBetween('payment_date', [$from, $to])
            ->orderBy('payment_date')
            ->get()
            ->map(function ($payment) {
                return [
                    'date'        => $payment->payment_date->format('Y-m-d'),
                    'entry_type'  => 'PAYMENT',
                    'description' => "Due bill collected ({$payment->payment_number})" . ($payment->remarks ? " - {$payment->remarks}" : ''),
                    'due_added'   => 0,
                    'paid_amount' => (float) $payment->amount,
                ];
            });

        $entries = $tokens->concat($payments)->sortBy('date')->values();

        $member = (new Member())->find($memberId);

        return [
            'member'  => $member,
            'entries' => $entries,
            'summary' => [
                'total_due_added'        => $entries->sum('due_added'),
                'total_paid'             => $entries->sum('paid_amount'),
                'current_due_balance'    => $member ? (float) $member->due_balance : 0,
            ],
        ];
    }

    // Per meal-type/date revenue summary — kitchen headcount + budget planning
    public function getMealCostSummary($from, $to)
    {
        return MealToken::query()
            ->select(
                'meal_date',
                'meal_type',
                DB::raw('COUNT(*) as tokens_count'),
                DB::raw('SUM(amount) as total_amount'),
                DB::raw("SUM(CASE WHEN payment_status = 'PAID' THEN amount ELSE 0 END) as paid_amount"),
                DB::raw("SUM(CASE WHEN payment_status = 'DUE' THEN amount ELSE 0 END) as due_amount")
            )
            ->whereBetween('meal_date', [$from, $to])
            ->groupBy('meal_date', 'meal_type')
            ->orderBy('meal_date')
            ->orderBy('meal_type')
            ->get();
    }
}
