import React, {FC, useState} from 'react'
import {Tag, Button} from 'antd'
import {DateTimeUtils, Message} from 'src/app/utils'
import AntTable from 'src/app/components/Table/AntTable'
import {MealTokenAction} from '../Actions/MealToken.actions'
import {MealTokenApi} from 'src/app/api'
import ViewAction from 'src/app/components/Actions/ViewAction'
import ListItemAction from 'src/app/components/Actions/ListItemAction'

const MealTokenListing: FC<any> = (props) => {
  const {loading, listData, selectedRowKeys, handleOnChanged, handleTableChange, handleCallbackFunc} = props
  const [collectingId, setCollectingId] = useState<any>(null)

  const handleCollect = (id: any) => {
    setCollectingId(id)
    MealTokenApi.collect(id)
      .then(() => {
        Message.success('Token marked as collected.')
        setCollectingId(null)
        handleCallbackFunc(null, 'reloadListing')
      })
      .catch((err: any) => {
        setCollectingId(null)
        const errMessage =
          err?.status === 422 && typeof err.data === 'string' ? err.data : 'A network error occurred. Please try again later.'
        Message.error(errMessage)
      })
  }

  const columns = [
    {
      dataIndex: 'token_number',
      key: 'token_number',
      title: 'Token No',
      sorter: true,
      width: '13%',
      render: (text: string, record: any, index: number) => (
        <ViewAction
          entityId={record.id}
          actionItem={MealTokenAction.COMMON_ACTION.VIEW}
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
      width: '17%',
      render: (text: string, record: any) => `${record.member_code ?? ''} - ${text ?? ''}`,
    },
    {
      dataIndex: 'meal_type',
      key: 'meal_type',
      title: 'Meal',
      sorter: true,
      width: '10%',
    },
    {
      dataIndex: 'meal_date',
      key: 'meal_date',
      title: 'Meal Date',
      sorter: true,
      width: '10%',
      render: (value: any) => DateTimeUtils.formatDate(value),
    },
    {
      dataIndex: 'amount',
      key: 'amount',
      title: 'Amount',
      width: '8%',
    },
    {
      dataIndex: 'payment_status',
      key: 'payment_status',
      title: 'Payment',
      width: '10%',
      render: (text: string) => <Tag color={text === 'PAID' ? 'green' : 'red'}>{text}</Tag>,
    },
    {
      dataIndex: 'collection_status',
      key: 'collection_status',
      title: 'Collection',
      width: '12%',
      render: (text: string, record: any) =>
        text === 'COLLECTED' ? (
          <Tag color='blue'>COLLECTED</Tag>
        ) : (
          <Button
            size='small'
            type='primary'
            loading={collectingId === record.id}
            onClick={() => handleCollect(record.id)}
          >
            Mark Collected
          </Button>
        ),
    },
    {
      dataIndex: 'action',
      key: 'action',
      title: 'Action',
      width: '10%',
      align: 'center',
      render: (text: string, record: any, index: number) => (
        <ListItemAction
          entityId={record.id}
          actionList={MealTokenAction.LIST_ITEM_ACTION}
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
        rowSelectionPermission='auth:mealToken:multiSelect'
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

export default React.memo(MealTokenListing)
