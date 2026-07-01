<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
</head>

@php
    $totalMaterialPrice = 0;
    $totalTransferredMaterialPrice = 0;
    $totalOverheadPrice = 0;
    $showingStart = 1;
@endphp

<body>
    <table>
        <thead>
            <tr className='text-center'>
                <td colspan="7">Job Order: {{ $jobOrderInfo->job_number }} - {{ $jobOrderInfo->job_title }}</td>
            </tr>
            <tr className='text-center'>
                <td colspan="7">Customer: {{ $jobOrderInfo->customer_name }}</td>
            </tr>
            <tr>
                <th>Serial No.</th>
                <th>Item Name</th>
                <th>UOM</th>
                <th>Consume Quantity</th>
                <th>Purchase Price</th>
                <th>Total Price</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td colspan="6">Consumptions Item List</td>
            </tr>
            @foreach ($consumptionItemList as $key => $itemData)
                <tr>
                    <td colspan="6" align='center'>[{{ $itemData['code'] }}] - {{ $itemData['item_name'] }}</td>
                </tr>
                @foreach ($itemData['itemWiseConsumptionHistoryList'] as $historyKey => $history)
                    @php
                        $totalMaterialPrice += $history['total_price']; // Accumulate total price
                    @endphp

                    <tr>
                        <td>{{ $showingStart++ }}</td>
                        <td>[{{ $itemData['code'] }}] - {{ $itemData['item_name'] }}</td>
                        <td>{{ $itemData['unit_short_name'] }}</td>
                        <td>{{ $history['quantity'] }}</td>
                        <td>{{ $history['unit_price'] }}</td>
                        <td>{{ $history['total_price'] }}</td>
                    </tr>
                @endforeach
            @endforeach

            <tr>
                <td colspan="5" align='right'>Total</td>
                <td>{{ $totalMaterialPrice }}</td>
            </tr>


            <tr>
                <td colspan="6">Material To Finish Goods Transfer List</td>
            </tr>
            @foreach ($transferredMaterialList as $key => $itemData)
                <tr>
                    <td colspan="6" align='center'>[{{ $itemData['code'] }}] - {{ $itemData['item_name'] }}</td>
                </tr>
                @foreach ($itemData['itemWiseTransferredHistoryList'] as $historyKey => $history)
                    @php
                        $totalTransferredMaterialPrice += $history['total_price']; // Accumulate total price
                    @endphp

                    <tr>
                        <td>{{ $showingStart++ }}</td>
                        <td>[{{ $itemData['code'] }}] - {{ $itemData['item_name'] }}</td>
                        <td>{{ $itemData->unit['short_name'] }}</td>
                        <td>{{ $history['quantity'] }}</td>
                        <td>{{ $history['unit_price'] }}</td>
                        <td>{{ $history['total_price'] }}</td>
                    </tr>
                @endforeach
            @endforeach

            <tr>
                <td colspan="5" align='right'>Total</td>
                <td>{{ $totalTransferredMaterialPrice }}</td>
            </tr>

            <tr>
                <td colspan="6">Project Overhead List</td>
            </tr>

            @foreach ($consumptionProjectOverheadList as $key => $overheadData)
                @php
                    $totalOverheadPrice += $overheadData['total_price']; // Accumulate total price
                @endphp

                <tr>
                    <td>{{ $showingStart++ }}</td>
                    <td>
                        [{{ $overheadData->projectOverheadInfo['code'] }}] -
                        {{ $overheadData->projectOverheadInfo['name'] }}
                    </td>
                    <td>{{ $overheadData->unitInfo['name'] }}</td>
                    <td>{{ $overheadData['quantity'] }}</td>
                    <td>{{ $overheadData['unit_price'] }}</td>
                    <td>{{ $overheadData['total_price'] }}</td>
                </tr>
            @endforeach

            <tr>
                <td colspan="5" align='right'>Total</td>
                <td>{{ $totalOverheadPrice }}</td>
            </tr>
        </tbody>

        <tfoot>
            <tr>
                <td colspan="5" align='right'>Grand Total (Consumptions Item + Project Overhead)</td>
                <td>{{ $totalMaterialPrice + $totalTransferredMaterialPrice + $totalOverheadPrice }}</td>
            </tr>
        </tfoot>

    </table>
</body>

</html>
