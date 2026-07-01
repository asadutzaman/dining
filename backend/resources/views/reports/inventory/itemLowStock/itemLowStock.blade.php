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
                <td colspan="8">Item Low Stock Report</td>
            </tr>

            <tr>
                <th>Serial No.</th>
                <th>Item (EN)</th>
                <th>Item (BN)</th>
                <th>Logistic</th>
                <th>Branch</th>
                <th>Shelve</th>
                <th>Reorder Quantity</th>
                <th>Balance Quantity</th>
                <th>Action From</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($results as $key => $itemData)
                <tr>
                    <td>{{ ++$key }}</td>
                    <td>{{ $itemData['item_name_en'] }}</td>
                    <td>{{ $itemData['item_name_bn'] }}</td>
                    <td>{{ $itemData['logistic_name'] }}</td>
                    <td>{{ $itemData['branch_name'] }}</td>
                    <td>{{ $itemData['shelve_name'] }}</td>
                    <td>{{ $itemData['reorder_qty'] }}</td>
                    <td>{{ $itemData['balance_quantity'] }}</td>
                    <td>{{ $itemData['action_from'] }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
</body>

</html>
