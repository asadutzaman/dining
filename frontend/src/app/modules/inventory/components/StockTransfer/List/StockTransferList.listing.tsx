import React, {FC, useContext} from 'react'
import ListItemAction from 'src/app/components/Actions/ListItemAction'
import ViewAction from 'src/app/components/Actions/ViewAction'
import AntTable from 'src/app/components/Table/AntTable'
import {StockTransferAction} from '../Actions/StockTransfer.actions'
import {DateTimeUtils} from 'src/app/utils'
import ModalAction from 'src/app/components/Actions/ModalAction'
import {AuthContext} from 'src/app/context/auth/auth.context'
import {useLang} from 'src/app/hooks/useLang'

const StockTransferListing: FC<any> = (props) => {
  const {userId} = useContext<any>(AuthContext)
  const {
    loading,
    listData,
    selectedRowKeys,
    handleOnChanged,
    handleTableChange,
    handleCallbackFunc,
  } = props
  const {t} = useLang()

  const onCheckIsShowAction = (actionItemInfo: any, recordItemInfo: any): boolean => {
    if (actionItemInfo.title === 'Edit' && !['DRAFT'].includes(recordItemInfo.process_status)) {
      return false
    }
    if (
      actionItemInfo.title === 'Delete' &&
      !['DRAFT', 'SUBMITTED'].includes(recordItemInfo.process_status)
    ) {
      return false
    }
    return true
  }

  const columns = [
    {
      dataIndex: 'transfer_to_branch',
      key: 'transfer_to_branch',
      title: t('Transfer To'),
      sorter: false,
      width: '25%',
      // old code: 
        /*  render: (text: string, record: any, index: number) => (
        <ViewAction
          entityId={record.id}
          actionItem={StockTransferAction.COMMON_ACTION.VIEW}
          defaultViewText={text}
          handleCallbackFunc={handleCallbackFunc}
        >
          <span className='grid-row-view-action fw-bolder cursor-pointer'>{text}</span>
        </ViewAction>
      ), */
      render: (text: string | any[], record: any, index: number) => {
        const displayText = Array.isArray(text)
          ? text.map((branch: any) => branch.branch_name).join(', ')
          : text
        return (
          <ViewAction
            entityId={record.id}
            actionItem={StockTransferAction.COMMON_ACTION.VIEW}
            defaultViewText={displayText}
            handleCallbackFunc={handleCallbackFunc}
          >
            <span className='grid-row-view-action fw-bolder cursor-pointer'>{displayText}</span>
          </ViewAction>
        )
      },
    },
    {
      dataIndex: 'reason',
      key: 'reason',
      title: t('Reason'),
      sorter: true,
      width: '15%',
    },
    {
      dataIndex: 'process_status',
      key: 'process_status',
      title: t('Process Status'),
      sorter: true,
      width: '15%',
    },
    {
      dataIndex: 'created_by_name',
      key: 'created_by_name',
      title: t('Created By'),
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
      align: 'center',
      render: (text: string, record: any, index: number) => (
        <ListItemAction
          entity={record}
          entityId={record.id}
          actionList={StockTransferAction.LIST_ITEM_ACTION}
          handleCallbackFunc={handleCallbackFunc}
          onCheckIsShowAction={onCheckIsShowAction}
        />
      ),
    },
  ]

  return (
    <div className='px-6'>
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

export default React.memo(StockTransferListing)
