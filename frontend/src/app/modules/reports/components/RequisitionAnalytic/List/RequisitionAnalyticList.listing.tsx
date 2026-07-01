import {Card, Spin} from 'antd'
import React, {FC} from 'react'
import AntTable from 'src/app/components/Table/AntTable'

import {DateTimeUtils} from 'src/app/utils'
import {useLang} from 'src/app/hooks/useLang'
import ViewAction from 'src/app/components/Actions/ViewAction'
import ReportHeader from 'src/app/components/Header/ReportHeader'
import {RequisitionAnalyticReportAction} from '../Action/RequisitionAnalyticReport.actions'

const RequisitionAnalyticListing: FC<any> = (props) => {
  const {t, lang} = useLang()
  const {
    loading,
    listData,
    pagination,
    selectedRowKeys,
    handleOnChanged,
    handleTableChange,
    handleCallbackFunc,
    logisticName,
  } = props
  let showingStart = (pagination?.currentPage - 1) * pagination?.pageSize + 1

  const columns = [
    {
      dataIndex: 'sn',
      key: 'sn',
      title: t('SL No.'),
      sorter: false,
      width: '5%',
      render: (value: any, record: any, index: number) => showingStart + index,
    },
    {
      dataIndex: 'requisition_number',
      key: 'requisition_number',
      title: t('Requisition No.'),
      sorter: false,
      width: '30%',
      render: (text: string, record: any, index: number) => (
        <ViewAction
          entityId={record.id}
          actionItem={RequisitionAnalyticReportAction.COMMON_ACTION.REQUISITION_VIEW}
          defaultViewText={text}
          handleCallbackFunc={handleCallbackFunc}
        >
          <span className='grid-row-view-action fw-bolder cursor-pointer'>{text}</span>
        </ViewAction>
      ),
    },
    {
      dataIndex: 'logistic_name',
      key: 'logistic_name',
      title: t('Logistic'),
      sorter: false,
      width: '15%',
    },
    {
      dataIndex: 'branch_name',
      key: 'branch_name',
      title: t('Request From DMP Unit'),
      sorter: false,
      width: '20%',
    },
    {
      dataIndex: 'process_status',
      key: 'process_status',
      title: t('Status'),
      sorter: false,
      width: '15%',
    },
    {
      dataIndex: 'created_at',
      key: 'created_at',
      title: t('Application Date'),
      sorter: false,
      width: '10%',
      render: (value: any) => DateTimeUtils.formatDateTimeA(value),
    },
    {
      dataIndex: 'request_by_name',
      key: 'request_by_name',
      title: t('Signature By'),
      sorter: false,
      width: '10%',
    },
    {
      dataIndex: 'delay_days',
      key: 'delay_days',
      title: t('Delay (in days)'),
      sorter: false,
      width: '10%',
    },
  ]

  return (
    <div className='px-6'>
      <ReportHeader title={t('Requisition Analytic Report')} />
      <AntTable
        className='table-layout'
        rowSelection={false}
        rowSelectionPermission='auth:requisition:multiSelect'
        selectedRowKeys={selectedRowKeys}
        dataSource={listData}
        columns={columns}
        loading={loading}
        handleOnChanged={handleOnChanged}
        onChange={handleTableChange}
      />
    </div>
  )
}

export default React.memo(RequisitionAnalyticListing)
