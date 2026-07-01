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
                <td colspan="9">Item Requisition Status Report</td>
            </tr>

            <tr>
                <th>Serial No.</th>
                <th>Thana</th>
                <th>Total Requisitions</th>
                <th>Pending Requisitions</th>
                <th>Approved Requisitions</th>
                <th>Rejected Requisitions</th>
                <th>Delayed Requisitions</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($results as $key => $itemData)
                <tr>
                    <td>{{ ++$key }}</td>
                    <td>{{ $itemData['branch_name'] }}</td>
                    <td>{{ $itemData['total_count'] }}</td>
                    <td>{{ $itemData['pending_count'] }}</td>
                    <td>{{ $itemData['approved_count'] }}</td>
                    <td>{{ $itemData['rejected_count'] }}</td>
                    <td>{{ $itemData['delayed_count'] }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
</body>

</html>
