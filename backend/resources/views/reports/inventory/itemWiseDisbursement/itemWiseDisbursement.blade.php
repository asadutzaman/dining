<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Requester Wise Disbursement</title>
</head>

<body>
    <table>
        <thead>
            <tr>
                <td colspan="8">Requester Wise Disbursement Report</td>
            </tr>
            <tr>
                <th>Serial No.</th>
                <th>Requester Name</th>
                <th>DMP Unit</th>
                <th>No of Requisitions</th>
                <th>Total Requested Quantity</th>
                <th>Total Received Quantity</th>
                <th>Last Receive Date</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($results as $key => $itemData)
                <tr>
                    <td>{{ ++$key }}</td>
                    <td>{{ $itemData['requester_name'] }}</td>
                    <td>{{ $itemData['dmp_unit'] }}</td>
                    <td>{{ $itemData['no_of_requisitions'] }}</td>
                    <td>{{ $itemData['total_requested_qty'] }}</td>
                    <td>{{ $itemData['total_received_qty'] }}</td>
                    <td>{{ $itemData['last_received_date'] }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
</body>

</html>
