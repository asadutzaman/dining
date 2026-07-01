import React, {FC} from 'react'
import ListItemAction from 'src/app/components/Actions/ListItemAction'
import ViewAction from 'src/app/components/Actions/ViewAction'
import AntTable from 'src/app/components/Table/AntTable'
import {StockAdjustmentApprovalAction} from '../Actions/StockAdjustmentApproval.actions'
import {useLang} from 'src/app/hooks/useLang'

const StockAdjustmentApprovalListing: FC<any> = (props) => {
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
    if (actionItemInfo.title === 'Delete' && ['APPROVED'].includes(recordItemInfo.process_status)) {
      return false
    }
    return true
  }

  const columns = [
    {
      dataIndex: 'stock_adjustment_number',
      key: 'stock_adjustment_number',
      title: t('Stock Adjustment Number'),
      sorter: true,
      width: '35%',
      render: (text: string, record: any, index: number) => (
        <ViewAction
          entityId={record.id}
          actionItem={StockAdjustmentApprovalAction.COMMON_ACTION.VIEW}
          defaultViewText={text}
          handleCallbackFunc={handleCallbackFunc}
        >
          <span className='grid-row-view-action fw-bolder cursor-pointer'>{text}</span>
        </ViewAction>
      ),
    },
    {
      dataIndex: 'branch_name',
      key: 'branch_name',
      title: t('Branch'),
      sorter: false,
      width: '30%',
    },
    {
      dataIndex: 'reason',
      key: 'reason',
      title: t('Reason'),
      sorter: true,
      width: '30%',
    },
    {
      dataIndex: 'adjustment_type',
      key: 'adjustment_type',
      title: t('Adjustment Type'),
      sorter: true,
      width: '30%',
    },
    {
      dataIndex: 'process_status',
      key: 'process_status',
      title: t('Process Status'),
      sorter: true,
      width: '30%',
      render: (text: string, record: any, index: number) =>
        text === 'APPROVED' ? (
          <span className='badge badge-success'>{text}</span>
        ) : (
          <span className='badge badge-warning'>{text}</span>
        ),
    },
    {
      dataIndex: 'created_by_name',
      key: 'created_by_name',
      title: t('Created By'),
      width: '10%',
    },
    {
      dataIndex: 'action',
      key: 'action',
      title: t('Action'),
      width: '5%',
      align: 'center',
      render: (text: string, record: any, index: number) => (
        <ListItemAction
          entity={record}
          entityId={record.id}
          actionList={StockAdjustmentApprovalAction.LIST_ITEM_ACTION}
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

export default React.memo(StockAdjustmentApprovalListing)
