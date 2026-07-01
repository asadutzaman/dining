import React, {FC} from 'react'
import ListItemAction from 'src/app/components/Actions/ListItemAction'
import ViewAction from 'src/app/components/Actions/ViewAction'
import AntTable from 'src/app/components/Table/AntTable'
import {CommonUtils} from 'src/app/utils'
import {GroupAction} from '../Actions/Group.actions'

const GroupListing: FC<any> = (props) => {
  const {
    loading,
    listData,
    selectedRowKeys,
    onChangeSwitchToggle,
    handleRefresh,
    handleOnChanged,
    handleTableChange,
    handleCallbackFunc,
  } = props
  const columns = [
    {
      dataIndex: 'sn',
      key: 'sn',
      title: 'SN',
      render: (text: string, record: any, index: number) => {
        return CommonUtils.ToLocalNumber(index + 1, false)
      },
    },
    {
      dataIndex: 'name',
      key: 'name',
      title: 'Group Name',
      sorter: true,
      render: (text: string, record: any, index: number) => (
        <ViewAction
          entityId={record.id}
          actionItem={GroupAction.COMMON_ACTION.VIEW}
          defaultViewText={text}
          handleCallbackFunc={handleCallbackFunc}
        >
          <span className='grid-row-view-action fw-bolder'>{text}</span>
        </ViewAction>
      ),
    },
    {
      dataIndex: 'code',
      key: 'code',
      title: 'Code',
      sorter: true,
    },
    {
      dataIndex: 'description',
      key: 'description',
      title: 'Group Description',
      sorter: true,
    },
    {
      dataIndex: 'role_name_list',
      key: 'role_name_list',
      title: 'Roles',
      render: (value: any) => value?.join(', '),
    },
    {
      dataIndex: 'created_by_name',
      key: 'created_by_name',
      title: 'Created By',
      sorter: true,
      width: '10%',
    },
    {
      dataIndex: 'status',
      key: 'status',
      title: 'Status',
      sorter: true,
      render: (text: string, record: any, index: number) =>
        CommonUtils.displaySwitchToggleBtn(record, record.status, onChangeSwitchToggle),
    },
    {
      dataIndex: 'action',
      key: 'action',
      title: 'Action',
      render: (text: string, record: any, index: number) => (
        <ListItemAction
          entityId={record.id}
          actionList={GroupAction.LIST_ITEM_ACTION}
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

export default React.memo(GroupListing)
