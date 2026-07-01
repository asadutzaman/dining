<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $mailData['subject'] }}</title>
</head>

<body>
    <h1>{{ $mailData['subject'] }}</h1>
    <p>
        <b>Production Transfer No:</b> {{ $mailData['record_no'] }} <br>
        <b>Job Number:</b> {{ $mailData['job_number'] }} <br>
        <b>Job Title:</b> {{ $mailData['job_title'] }} <br>
        <b>Customer Name:</b> {{ $mailData['customer_name'] }} <br>
        <b>Created By:</b> {{ $mailData['created_by'] }} <br>
        <b>Process Status:</b> {{ $mailData['process_status'] }} <br>
        <b>Action:</b> {{ $mailData['action'] }} <br>
        <b>Next Action:</b> {{ $mailData['next_action'] }}
    </p>

    <address>
        Thank you <br>
        LIMS SCM ERP
    </address>
</body>

</html>
