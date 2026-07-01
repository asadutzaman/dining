<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
</head>

<body>
    <table>
        <thead>
            <tr className='text-center'>
                <td colspan="7">Item Stock Analytics Report</td>
            </tr>

            <tr>
                <th>Serial No.</th>
                <th>Item</th>
                <th>Category</th>
                <th>Unit</th>
                <th>Total GRN Qty</th>
                <th>Total Disbursement Qty</th>
                <th>Current Stock</th>
                <th>Running Demand</th>
                <th>Demand-Stock Gap</th>
                <th>Risk Status</th>
                <th>Last GRN Date</th>
                <th>Last Disbursement Date</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($results as $key => $itemData)
                <tr>
                    <td>{{ ++$key }}</td>
                    <td>{{ $itemData['item_name_en'] }}</td>
                    <td>{{ $itemData['category_name'] }}</td>
                    <td>{{ $itemData['unit_name'] }}</td>
                    <td>{{ $itemData['total_grn_qty'] }}</td>
                    <td>{{ $itemData['total_disburse_qty'] }}</td>
                    <td>{{ $itemData['current_stock'] }}</td>
                    <td>{{ $itemData['running_demand'] }}</td>
                    <td>{{ $itemData['demand_stock_gap'] }}</td>
                    <td>{{ $itemData['risk_status'] }}</td>
                    <td>{{ $itemData['last_grn_date'] }}</td>
                    <td>{{ $itemData['last_disburse_date'] }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
</body>

</html>
