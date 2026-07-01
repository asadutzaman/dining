import React, {FC} from 'react'
import {CommonUtils, DateTimeUtils} from 'src/app/utils'
import AntTable from 'src/app/components/Table/AntTable'
import {ExampleAction} from '../Actions/Example.actions'
import ViewAction from 'src/app/components/Actions/ViewAction'
import ListItemAction from 'src/app/components/Actions/ListItemAction'

const ExampleListing: FC<any> = (props) => {
  const {
    loading,
    listData,
    selectedRowKeys,
    onChangeSwitchToggle,
    handleOnChanged,
    handleTableChange,
    handleCallbackFunc,
  } = props
  const columns = [
    {
      dataIndex: 'title',
      key: 'title',
      title: 'Title',
      sorter: true,
      width: '20%',
      render: (text: string, record: any, index: number) => (
        <ViewAction
          entityId={record.id}
          actionItem={ExampleAction.COMMON_ACTION.VIEW}
          defaultViewText={text}
          handleCallbackFunc={handleCallbackFunc}
        >
          <span className='grid-row-view-action'>{text}</span>
        </ViewAction>
      ),
    },
    {
      dataIndex: 'description',
      key: 'description',
      title: 'Description',
      sorter: true,
      width: '35%',
    },
    {
      dataIndex: 'created_at',
      key: 'created_at',
      title: 'Created Time',
      sorter: true,
      width: '25%',
      render: (value: any) => DateTimeUtils.formatDateTimeA(value),
    },
    {
      dataIndex: 'status',
      key: 'status',
      title: 'Status',
      sorter: true,
      width: '10%',
      render: (text: string, record: any, index: number) =>
        CommonUtils.displaySwitchToggleBtn(record, record.status, onChangeSwitchToggle),
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
          actionList={ExampleAction.LIST_ITEM_ACTION}
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
        rowSelectionPermission='auth:example:multiSelect'
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

export default React.memo(ExampleListing)
