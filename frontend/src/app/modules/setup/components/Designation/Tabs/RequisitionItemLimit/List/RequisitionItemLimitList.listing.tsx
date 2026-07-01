import React, {FC} from 'react'
import ListItemAction from 'src/app/components/Actions/ListItemAction'
import AntTable from 'src/app/components/Table/AntTable'
import {RequisitionItemLimitAction} from '../Actions/RequisitionItemLimit.actions'
import {DateTimeUtils} from 'src/app/utils'
import {useLang} from 'src/app/hooks/useLang'
import {DATE_FORMAT_DATABASE} from 'src/app/constants/common.constant'

const RequisitionItemLimitListing: FC<any> = (props) => {
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
      dataIndex: 'item_id',
      key: 'item_id',
      title: t('Item'),
      sorter: true,
      width: '20%',
      render: (_: any, record: any) => record.item_name,
    },
    {
      dataIndex: 'limit_type',
      key: 'limit_type',
      title: t('Limit Type'),
      sorter: true,
      width: '10%',
    },
    {
      dataIndex: 'max_qty',
      key: 'max_qty',
      title: t('Max Qty'),
      sorter: true,
      width: '10%',
    },
    {
      dataIndex: 'effective_from',
      key: 'effective_from',
      title: t('Effective From'),
      sorter: true,
      width: '10%',
      render: (value: any) => DateTimeUtils.formatDate(value, DATE_FORMAT_DATABASE),
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
      dataIndex: 'action',
      key: 'action',
      title: t('Action'),
      width: '10%',
      align: 'center',
      render: (text: string, record: any, index: number) => (
        <ListItemAction
          entity={record}
          entityId={record.id}
          actionList={RequisitionItemLimitAction.LIST_ITEM_ACTION}
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
        rowSelectionPermission='auth:requisitionItemLimit:multiSelect'
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

export default React.memo(RequisitionItemLimitListing)
