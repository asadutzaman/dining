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
                <td colspan="12">Requisition Analytic Report</td>
            </tr>

            <tr>
                <th>Serial No.</th>
                <th>Requisition No.</th>
                <th>Logistic</th>
                <th>Request From DMP Unit</th>
                <th>Status</th>
                <th>Application Date</th>
                <th>Singnature By</th>
                <th>Delay (in days)</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($results as $key => $itemData)
                <tr>
                    <td>{{ ++$key }}</td>
                    <td>{{ $itemData['requisition_number'] }}</td>
                    <td>{{ $itemData['logistic_name'] }}</td>
                    <td>{{ $itemData['branch_name'] }}</td>
                    <td>{{ $itemData['process_status'] }}</td>
                    <td>{{ $itemData['created_at'] }}</td>
                    <td>{{ $itemData['request_by_name'] }}</td>
                    <td>{{ $itemData['delay_days'] }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
</body>

</html>
