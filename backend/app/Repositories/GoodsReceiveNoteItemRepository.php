<?php

namespace App\Repositories;

use App\Models\GoodsReceiveNoteItem;
use App\Services\ODataService;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Helper;

class GoodsReceiveNoteItemRepository extends BaseRepository
{
    /**
     * @var GoodsReceiveNoteItem
     */
    protected $model;

    protected $request;

    protected $oDataService;

    protected $fieldSearchable = ['item_id'];

    public function __construct()
    {
        $this->model         = new GoodsReceiveNoteItem();
    }
    protected function init()
    {
        $this->request      = request();
        $this->oDataService = (new ODataService())->init();
    }

    public function deleteGRNItemByIds($goodReceiveNoteId, $grnitemIds)
    {
        return $this->newQuery()
            ->where('goods_receive_note_id', $goodReceiveNoteId)
            ->whereNotIn('id', $grnitemIds)
            ->delete();
    }

    // Item Wise Grn Details
    public function getItemGrnDetails($params)
    {
        $itemId = $params['item_id'] ?? null;
        $financialYear = $params['financial_year'] ?? null; // "2026-2027"
        // $helper = new Helper;
        $dateRange = $this->getFiscalYearRange($financialYear); // if null then it take running financial year
        if (!$itemId && !$dateRange) {
            return [];
        }
        // For Older Years Opening Balance Checking
        $previousYearsOpeningBalance = $this->newQuery()
            ->join('goods_receive_notes', 'goods_receive_notes.id', '=', 'goods_receive_note_items.goods_receive_note_id')
            ->whereDate('goods_receive_notes.created_at', '<', $dateRange['start_date'])
            // ->whereYear('goods_receive_notes.received_date', '<', $financialYear)
            // ->whereNotBetween('goods_receive_notes.created_at', [$dateRange['start_date'], $dateRange['end_date']])
            ->where('goods_receive_note_items.item_id', $itemId)
            ->sum('goods_receive_note_items.quantity');

        $previousYearsGrnData = collect([
            'previous_year' => true,
            'grn_date' => null,
            'grn_id' => '--',
            'grn_number' => '--',
            'opening_balance' => 0,
            'received_qty' => $previousYearsOpeningBalance,
            'total_balance' => $previousYearsOpeningBalance,
            'year' => null,
        ]);

        $currentYearGrnData = $this->newQuery()
            ->select(
                'goods_receive_notes.id as grn_id',
                'goods_receive_notes.grn_number as grn_number',
                'goods_receive_note_items.quantity as received_qty',
                'goods_receive_notes.received_date as grn_date'
            )
            ->join('goods_receive_notes', 'goods_receive_notes.id', '=', 'goods_receive_note_items.goods_receive_note_id')
            // ->whereYear('goods_receive_notes.received_date', $financialYear)
            ->whereBetween('goods_receive_notes.created_at', [$dateRange['start_date'], $dateRange['end_date']])
            ->where('goods_receive_note_items.item_id', $itemId)
            ->orderBy('goods_receive_notes.received_date', 'asc')
            ->orderBy('goods_receive_notes.id', 'asc')
            ->get();

        $openingBalance = $previousYearsOpeningBalance;
        foreach ($currentYearGrnData as $item) {
            $item->opening_balance = $openingBalance;
            $item->total_balance = $openingBalance + $item->received_qty;
            $item->year = Carbon::parse($item->grn_date)->format('Y');
            $openingBalance = $item->total_balance;
        }

        // push previous years grn data to currentYearGrnData
        $results = $currentYearGrnData->push($previousYearsGrnData);
        return $results;
    }

    public function getFiscalYearRange(?string $financialYear = null): array
    {
        if (empty($financialYear)) {
            $now = Carbon::now('Asia/Dhaka');
            $startYear = $now->month >= 7 ? $now->year : $now->year - 1;
            $endYear   = $startYear + 1;
        } else {
            $parts = explode('-', $financialYear);
            if (count($parts) < 2) {
                throw new \InvalidArgumentException('Invalid financial year format');
            }
            $startYear = (int) trim($parts[0]);
            $endYear   = (int) trim($parts[1]);
            if ($startYear <= 0 || $endYear <= 0) {
                throw new \InvalidArgumentException('Invalid financial year values');
            }
        }

        return [
            'start_date' => Carbon::createFromDate($startYear, 7, 1)->startOfDay()->toDateTimeString(),
            'end_date'   => Carbon::createFromDate($endYear, 6, 30)->endOfDay()->toDateTimeString(),
        ];
    }
}
