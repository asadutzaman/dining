import React, {FC, useEffect, useState} from 'react'
import download from 'downloadjs'
import {DatePicker, Button, Table} from 'antd'
import dayjs from 'dayjs'
import {DiningReportApi} from 'src/app/api'
import {Message} from 'src/app/utils'

const MonthlyReportController: FC = () => {
  const [month, setMonth] = useState<any>(dayjs())
  const [loading, setLoading] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)
  const [listData, setListData] = useState<any[]>([])

  const loadData = () => {
    setLoading(true)
    DiningReportApi.getMonthlySummary({year: month.year(), month: month.month() + 1})
      .then((res: any) => {
        setListData(res.data.results)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
        Message.error('A network error occurred. Please try again later.')
      })
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleExport = () => {
    setExportLoading(true)
    DiningReportApi.getMonthlySummaryExport({year: month.year(), month: month.month() + 1})
      .then((res: any) => {
        download(new Blob([res.data]), 'dining-monthly-report.xlsx', {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        setExportLoading(false)
      })
      .catch(() => {
        setExportLoading(false)
        Message.error('A network error occurred. Please try again later.')
      })
  }

  const columns = [
    {title: 'Member Code', dataIndex: 'member_code', key: 'member_code'},
    {title: 'Name', dataIndex: 'member_name', key: 'member_name'},
    {title: 'Type', dataIndex: 'member_type', key: 'member_type'},
    {title: 'Tokens', dataIndex: 'tokens_count', key: 'tokens_count'},
    {title: 'Total Amount', dataIndex: 'total_amount', key: 'total_amount'},
    {title: 'Paid Amount', dataIndex: 'paid_amount', key: 'paid_amount'},
    {title: 'Due Amount', dataIndex: 'due_amount', key: 'due_amount'},
    {title: 'Payments Collected', dataIndex: 'payments_collected', key: 'payments_collected'},
    {title: 'Current Due Balance', dataIndex: 'current_due_balance', key: 'current_due_balance'},
  ]

  return (
    <div className='card'>
      <div className='p-6'>
        <h3 className='mb-6'>Monthly Report (All Members)</h3>

        <div className='d-flex align-items-end mb-6' style={{gap: 16}}>
          <div>
            <label className='fw-bold mb-2 d-block'>Month</label>
            <DatePicker picker='month' value={month} onChange={(value) => value && setMonth(value)} />
          </div>
          <Button type='primary' loading={loading} onClick={loadData}>
            Load
          </Button>
          <Button loading={exportLoading} onClick={handleExport}>
            Export as XLS
          </Button>
        </div>

        <Table rowKey='member_id' loading={loading} dataSource={listData} columns={columns} scroll={{x: true}} />
      </div>
    </div>
  )
}

export default MonthlyReportController
