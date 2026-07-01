import React, {FC} from 'react'
import ListItemAction from 'src/app/components/Actions/ListItemAction'
import ViewAction from 'src/app/components/Actions/ViewAction'
import AntTable from 'src/app/components/Table/AntTable'
import {DateTimeUtils} from 'src/app/utils'
import {BranchAction} from '../Actions/Branch.actions'
import {useLang} from 'src/app/hooks/useLang'

const BranchListing: FC<any> = (props) => {
  const {
    loading,
    listData,
    selectedRowKeys,
    handleOnChanged,
    handleTableChange,
    handleCallbackFunc,
  } = props
  const {t} = useLang()
  const columns = [
    {
      dataIndex: 'name',
      key: 'name',
      title: t('Name'),
      sorter: true,
      width: '20%',
      render: (text: string, record: any, index: number) => (
        <ViewAction
          entityId={record.id}
          actionItem={BranchAction.COMMON_ACTION.VIEW}
          defaultViewText={text}
          handleCallbackFunc={handleCallbackFunc}
        >
          <span className='grid-row-view-action fw-bolder cursor-pointer'>{text}</span>
        </ViewAction>
      ),
    },
    {
      dataIndex: 'parent_name',
      key: 'parent_name',
      title: t('Parent Branch'),
      width: '10%',
    },
    {
      dataIndex: 'type',
      key: 'type',
      title: t('Type'),
      sorter: true,
      width: '10%',
    },
    {
      dataIndex: 'address',
      key: 'address',
      title: t('Address'),
      sorter: true,
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
      dataIndex: 'updated_at',
      key: 'updated_at',
      title: t('Updated Time'),
      sorter: true,
      width: '10%',
      render: (value: any) => DateTimeUtils.formatDateTimeA(value),
    },
    {
      dataIndex: 'action',
      key: 'action',
      title: t('Action'),
      width: '10%',
      render: (text: string, record: any, index: number) => (
        <ListItemAction
          entityId={record.id}
          actionList={BranchAction.LIST_ITEM_ACTION}
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

export default React.memo(BranchListing)
