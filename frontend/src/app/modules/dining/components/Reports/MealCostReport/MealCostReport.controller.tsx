import React, {FC, useEffect, useState} from 'react'
import download from 'downloadjs'
import {DatePicker, Button, Table} from 'antd'
import dayjs from 'dayjs'
import {DiningReportApi} from 'src/app/api'
import {Message} from 'src/app/utils'

const {RangePicker} = DatePicker

const MealCostReportController: FC = () => {
  const [dateRange, setDateRange] = useState<any>([dayjs().startOf('month'), dayjs()])
  const [loading, setLoading] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)
  const [listData, setListData] = useState<any[]>([])

  const loadData = () => {
    setLoading(true)
    DiningReportApi.getMealCostSummary({
      from: dateRange[0].format('YYYY-MM-DD'),
      to: dateRange[1].format('YYYY-MM-DD'),
    })
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
    DiningReportApi.getMealCostSummaryExport({
      from: dateRange[0].format('YYYY-MM-DD'),
      to: dateRange[1].format('YYYY-MM-DD'),
    })
      .then((res: any) => {
        download(new Blob([res.data]), 'dining-meal-cost-report.xlsx', {
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
    {title: 'Meal Date', dataIndex: 'meal_date', key: 'meal_date'},
    {title: 'Meal Type', dataIndex: 'meal_type', key: 'meal_type'},
    {title: 'Tokens Issued', dataIndex: 'tokens_count', key: 'tokens_count'},
    {title: 'Total Amount', dataIndex: 'total_amount', key: 'total_amount'},
    {title: 'Paid Amount', dataIndex: 'paid_amount', key: 'paid_amount'},
    {title: 'Due Amount', dataIndex: 'due_amount', key: 'due_amount'},
  ]

  return (
    <div className='card'>
      <div className='p-6'>
        <h3 className='mb-6'>Meal Cost Summary (Kitchen Planning)</h3>
        <p className='text-muted mb-6'>
          Headcount and revenue per meal per day — use this to plan kitchen quantities and track paid vs. due
          collections.
        </p>

        <div className='d-flex align-items-end mb-6' style={{gap: 16}}>
          <div>
            <label className='fw-bold mb-2 d-block'>Date Range</label>
            <RangePicker value={dateRange} onChange={(value) => value && setDateRange(value)} />
          </div>
          <Button type='primary' loading={loading} onClick={loadData}>
            Load
          </Button>
          <Button loading={exportLoading} onClick={handleExport}>
            Export as XLS
          </Button>
        </div>

        <Table
          rowKey={(row: any, index: any) => index}
          loading={loading}
          dataSource={listData}
          columns={columns}
        />
      </div>
    </div>
  )
}

export default MealCostReportController
