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
                <td colspan="7">Job Order: {{ $jobOrderInfo->job_number }} - {{ $jobOrderInfo->job_title }}</td>
            </tr>
            <tr className='text-center'>
                <td colspan="7">Customer: {{ $jobOrderInfo->customer_name }}</td>
            </tr>
            <tr>
                <th>Serial No.</th>
                <th>Product Name</th>
                <th>UOM</th>
                <th>Balance Quantity</th>
                <th>Unit Price</th>
                <th>Warehouse</th>
                <th>Shelve Location</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($results as $key => $itemData)
                <tr>
                    <td>{{ ++$key }}</td>
                    <td>[{{ $itemData['product_code'] }}] - {{ $itemData['product_name'] }}</td>
                    <td>{{ $itemData['unit_name'] }}</td>
                    <td>{{ $itemData['quantity_balance'] }}</td>
                    <td></td>
                    <td>{{ $itemData['warehouse_name'] ?? '' }}</td>
                    <td>{{ $itemData['shelve_location_name'] ?? '' }}</td>
                </tr>
            @endforeach

        </tbody>
    </table>
</body>

</html>
