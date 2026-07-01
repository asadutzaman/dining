import React, {FC} from 'react'
import ListItemAction from 'src/app/components/Actions/ListItemAction'
import ViewAction from 'src/app/components/Actions/ViewAction'
import AntTable from 'src/app/components/Table/AntTable'
import {CommonUtils, DateTimeUtils} from 'src/app/utils'
import {UserAction} from '../Actions/User.actions'
import {useLang} from 'src/app/hooks/useLang'

const UserListing: FC<any> = (props) => {
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
  const {t} = useLang()
  const columns = [
    {
      dataIndex: 'sn',
      key: 'sn',
      title: t('SN'),
      width: '5%',
      render: (text: string, record: any, index: number) => {
        return CommonUtils.ToLocalNumber(index + 1, false)
      },
    },
    {
      dataIndex: 'name',
      key: 'name',
      title: t('Name'),
      sorter: true,
      width: '20%',
      render: (text: string, record: any, index: number) => (
        <ViewAction
          entityId={record.id}
          actionItem={UserAction.COMMON_ACTION.VIEW}
          defaultViewText={text}
          handleCallbackFunc={handleCallbackFunc}
        >
          <span className='grid-row-view-action fw-bolder cursor-pointer'>{text}</span>
        </ViewAction>
      ),
    },
    {
      dataIndex: 'designation_id',
      key: 'designation_id',
      title: t('Designation'),
      sorter: true,
      width: '10%',
      render: (text: string, record: any, index: number) => record.designation_name,
    },
    {
      dataIndex: 'email',
      key: 'email',
      title: t('Email'),
      sorter: true,
      width: '10%',
    },
    {
      dataIndex: 'phone',
      key: 'phone',
      title: t('Phone'),
      sorter: true,
      width: '10%',
    },
    {
      dataIndex: 'branch_name',
      key: 'branch_name',
      title: t('Branch'),
      sorter: false,
      width: '10%',
    },
    {
      dataIndex: 'created_by_name',
      key: 'created_by_name',
      title: t('Created By'),
      sorter: false,
      width: '10%',
    },
    {
      dataIndex: 'created_at',
      key: 'created_at',
      title: t('Created Time'),
      sorter: true,
      width: '10%',
      render: (value: any) => DateTimeUtils.formatDateTimeA(value),
    },
    {
      dataIndex: 'status',
      key: 'status',
      title: t('Status'),
      sorter: true,
      width: '10%',
      render: (text: string, record: any, index: number) =>
        CommonUtils.displaySwitchToggleBtn(record, record.status, onChangeSwitchToggle),
    },
    {
      dataIndex: 'action',
      key: 'action',
      title: t('Action'),
      width: '10%',
      render: (text: string, record: any, index: number) => (
        <ListItemAction
          entityId={record.id}
          actionList={UserAction.LIST_ITEM_ACTION}
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

export default React.memo(UserListing)
