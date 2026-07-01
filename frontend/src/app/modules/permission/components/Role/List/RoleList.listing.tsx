import React, {FC} from 'react'
import ListItemAction from 'src/app/components/Actions/ListItemAction'
import ViewAction from 'src/app/components/Actions/ViewAction'
import AntTable from 'src/app/components/Table/AntTable'
import {CommonUtils, DateTimeUtils} from 'src/app/utils'
import {RoleAction} from '../Actions/Role.actions'
import {useLang} from 'src/app/hooks/useLang'

const RoleListing: FC<any> = (props) => {
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
      render: (text: string, record: any, index: number) => {
        return CommonUtils.ToLocalNumber(index + 1, false)
      },
    },
    {
      dataIndex: 'name',
      key: 'name',
      title: t('Role Name'),
      sorter: true,
      render: (text: string, record: any, index: number) => (
        <ViewAction
          entityId={record.id}
          actionItem={RoleAction.COMMON_ACTION.VIEW}
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
      title: t('Code'),
      sorter: true,
    },
    {
      dataIndex: 'description',
      key: 'description',
      title: t('Description'),
      sorter: false,
    },
    {
      dataIndex: 'created_by',
      key: 'created_by',
      title: t('Created By'),
      sorter: true,
      width: '10%',
      render: (text: string, record: any, index: number) => record.created_by_name,
    },
    {
      dataIndex: 'created_at',
      key: 'created_at',
      title: t('Created Time'),
      sorter: true,
      render: (value: any) => DateTimeUtils.formatDateTimeA(value),
    },
    {
      dataIndex: 'action',
      key: 'action',
      title: t('Action'),
      render: (text: string, record: any, index: number) => (
        <ListItemAction
          entityId={record.id}
          actionList={RoleAction.LIST_ITEM_ACTION}
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

export default React.memo(RoleListing)
