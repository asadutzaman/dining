<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>DMP Unit Wise Disbursement</title>
</head>

<body>
    <table>
        <thead>
            <tr>
                <td colspan="8">DMP Unit Wise Disbursement Report</td>
            </tr>
            <tr>
                <td colspan="8">
                    DMP Unit: {{ $branchInfo['name'] ?? '' }}
                </td>
            </tr>
            <tr>
                <th>Serial No.</th>
                <th>Item </th>
                <th>Unit</th>
                <th>Total Requested Quantity</th>
                <th>Total Received Quantity</th>
                <th>Last Receive Date</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($results as $key => $itemData)
                <tr>
                    <td>{{ ++$key }}</td>
                    <td>{{ $itemData['item_name_en'] }}</td>
                    <td>{{ $itemData['unit'] }}</td>
                    <td>{{ $itemData['total_requested_qty'] }}</td>
                    <td>{{ $itemData['total_received_qty'] }}</td>
                    <td>{{ $itemData['last_received_date'] }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
</body>

</html>
