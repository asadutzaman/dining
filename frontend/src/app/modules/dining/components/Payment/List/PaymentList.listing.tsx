import React, {FC} from 'react'
import {DateTimeUtils} from 'src/app/utils'
import AntTable from 'src/app/components/Table/AntTable'
import {PaymentAction} from '../Actions/Payment.actions'
import ViewAction from 'src/app/components/Actions/ViewAction'
import ListItemAction from 'src/app/components/Actions/ListItemAction'

const PaymentListing: FC<any> = (props) => {
  const {loading, listData, selectedRowKeys, handleOnChanged, handleTableChange, handleCallbackFunc} = props

  const columns = [
    {
      dataIndex: 'payment_number',
      key: 'payment_number',
      title: 'Payment No',
      sorter: true,
      width: '15%',
      render: (text: string, record: any, index: number) => (
        <ViewAction
          entityId={record.id}
          actionItem={PaymentAction.COMMON_ACTION.VIEW}
          defaultViewText={text}
          handleCallbackFunc={handleCallbackFunc}
        >
          <span className='grid-row-view-action'>{text}</span>
        </ViewAction>
      ),
    },
    {
      dataIndex: 'member_name',
      key: 'member_name',
      title: 'Member',
      width: '20%',
      render: (text: string, record: any) => `${record.member_code ?? ''} - ${text ?? ''}`,
    },
    {
      dataIndex: 'amount',
      key: 'amount',
      title: 'Amount',
      sorter: true,
      width: '15%',
    },
    {
      dataIndex: 'payment_date',
      key: 'payment_date',
      title: 'Payment Date',
      sorter: true,
      width: '15%',
      render: (value: any) => DateTimeUtils.formatDate(value),
    },
    {
      dataIndex: 'remarks',
      key: 'remarks',
      title: 'Remarks',
      width: '20%',
    },
    {
      dataIndex: 'action',
      key: 'action',
      title: 'Action',
      width: '15%',
      align: 'center',
      render: (text: string, record: any, index: number) => (
        <ListItemAction
          entityId={record.id}
          actionList={PaymentAction.LIST_ITEM_ACTION}
          handleCallbackFunc={handleCallbackFunc}
        />
      ),
    },
  ]

  return (
    <div className='px-6'>
      <AntTable
        className='table-layout'
        rowSelection={false}
        scroll={{y: 500}}
        rowSelectionPermission='auth:payment:multiSelect'
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

export default React.memo(PaymentListing)
