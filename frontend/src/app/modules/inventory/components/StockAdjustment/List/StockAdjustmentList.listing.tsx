import React, {FC} from 'react'
import ListItemAction from 'src/app/components/Actions/ListItemAction'
import ViewAction from 'src/app/components/Actions/ViewAction'
import AntTable from 'src/app/components/Table/AntTable'
import {StockAdjustmentAction} from '../Actions/StockAdjustment.actions'
import {DateTimeUtils} from 'src/app/utils'
import {useLang} from 'src/app/hooks/useLang'

const StockAdjustmentListing: FC<any> = (props) => {
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
      width: '20%',
      render: (text: string, record: any, index: number) => (
        <ViewAction
          entityId={record.id}
          actionItem={StockAdjustmentAction.COMMON_ACTION.VIEW}
          defaultViewText={text}
          handleCallbackFunc={handleCallbackFunc}
        >
          <span className='grid-row-view-action fw-bolder cursor-pointer'>{text}</span>
        </ViewAction>
      ),
    },
    {
      dataIndex: 'branch_id',
      key: 'branch_id',
      title: t('Branch'),
      sorter: true,
      width: '10%',
      render: (text: string, record: any, index: number) => record.branch_name,
    },
    {
      dataIndex: 'reason',
      key: 'reason',
      title: t('Reason'),
      sorter: true,
      width: '10%',
    },
    {
      dataIndex: 'adjustment_type',
      key: 'adjustment_type',
      title: t('Adjustment Type'),
      sorter: true,
      width: '10%',
    },
    {
      dataIndex: 'process_status',
      key: 'process_status',
      title: t('Process Status'),
      sorter: true,
      width: '10%',
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
      width: '5%',
      align: 'center',
      render: (text: string, record: any, index: number) => (
        <ListItemAction
          entity={record}
          entityId={record.id}
          actionList={StockAdjustmentAction.LIST_ITEM_ACTION}
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

export default React.memo(StockAdjustmentListing)
