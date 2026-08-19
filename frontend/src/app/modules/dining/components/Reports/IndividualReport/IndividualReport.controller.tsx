import React, {FC, useState} from 'react'
import download from 'downloadjs'
import {DatePicker, Button, Table, Statistic, Row, Col} from 'antd'
import dayjs from 'dayjs'
import {DiningReportApi} from 'src/app/api'
import {Message} from 'src/app/utils'
import MemberSelect from 'src/app/components/Dropdown/MemberSelect'

const {RangePicker} = DatePicker

const IndividualReportController: FC = () => {
  const [memberId, setMemberId] = useState<any>(null)
  const [dateRange, setDateRange] = useState<any>([dayjs().startOf('month'), dayjs()])
  const [loading, setLoading] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const loadData = () => {
    if (!memberId) {
      Message.error('Please select a member.')
      return
    }
    setLoading(true)
    DiningReportApi.getIndividualStatement({
      member_id: memberId,
      from: dateRange[0].format('YYYY-MM-DD'),
      to: dateRange[1].format('YYYY-MM-DD'),
    })
      .then((res: any) => {
        setResult(res.data)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
        Message.error('A network error occurred. Please try again later.')
      })
  }

  const handleExport = () => {
    if (!memberId) {
      Message.error('Please select a member.')
      return
    }
    setExportLoading(true)
    DiningReportApi.getIndividualStatementExport({
      member_id: memberId,
      from: dateRange[0].format('YYYY-MM-DD'),
      to: dateRange[1].format('YYYY-MM-DD'),
    })
      .then((res: any) => {
        download(new Blob([res.data]), 'dining-individual-statement.xlsx', {
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
    {title: 'Date', dataIndex: 'date', key: 'date'},
    {title: 'Type', dataIndex: 'entry_type', key: 'entry_type'},
    {title: 'Description', dataIndex: 'description', key: 'description'},
    {title: 'Due Added', dataIndex: 'due_added', key: 'due_added'},
    {title: 'Paid Amount', dataIndex: 'paid_amount', key: 'paid_amount'},
  ]

  return (
    <div className='card'>
      <div className='p-6'>
        <h3 className='mb-6'>Individual Member Statement</h3>

        <div className='d-flex align-items-end mb-6' style={{gap: 16}}>
          <div style={{minWidth: 260}}>
            <label className='fw-bold mb-2 d-block'>Member</label>
            <MemberSelect memberId={memberId} onSelect={(value: any) => setMemberId(value)} />
          </div>
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

        {result && (
          <>
            <Row gutter={[16, 16]} className='mb-6'>
              <Col md={8} xs={24}>
                <Statistic title='Total Due Added' value={result.summary.total_due_added} />
              </Col>
              <Col md={8} xs={24}>
                <Statistic title='Total Paid' value={result.summary.total_paid} />
              </Col>
              <Col md={8} xs={24}>
                <Statistic
                  title='Current Due Balance'
                  value={result.summary.current_due_balance}
                  valueStyle={{color: Number(result.summary.current_due_balance) > 0 ? '#cf1322' : '#3f8600'}}
                />
              </Col>
            </Row>
            <Table rowKey={(row: any, index: any) => index} loading={loading} dataSource={result.entries} columns={columns} />
          </>
        )}
      </div>
    </div>
  )
}

export default IndividualReportController
