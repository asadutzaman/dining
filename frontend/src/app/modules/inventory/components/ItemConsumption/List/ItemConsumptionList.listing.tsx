import React, {FC} from 'react'
import ListItemAction from 'src/app/components/Actions/ListItemAction'
import ViewAction from 'src/app/components/Actions/ViewAction'
import AntTable from 'src/app/components/Table/AntTable'
import {ItemConsumptionAction} from '../Actions/ItemConsumption.actions'
import {DateTimeUtils} from 'src/app/utils'
import {useLang} from 'src/app/hooks/useLang'

const ItemConsumptionListing: FC<any> = (props) => {
  const {
    loading,
    listData,
    selectedRowKeys,
    handleOnChanged,
    handleTableChange,
    handleCallbackFunc,
  } = props
  const {t, lang} = useLang()
  const columns = [
    {
      dataIndex: 'item_name',
      key: 'item_name',
      title: t('Item Name'),
      sorter: true,
      width: '25%',
      render: (text: string, record: any, index: number) => (
        <ViewAction
          entityId={record.id}
          actionItem={ItemConsumptionAction.COMMON_ACTION.VIEW}
          defaultViewText={text}
          handleCallbackFunc={handleCallbackFunc}
        >
          <span className='grid-row-view-action fw-bolder cursor-pointer'>
            {lang === 'en' ? record.item_name_en : record.item_name_bn}
          </span>
        </ViewAction>
      ),
    },
    {
      dataIndex: 'branch_id',
      key: 'branch_id',
      title: t('Branch'),
      sorter: true,
      width: '15%',
      render: (text: string, record: any, index: number) => record.branch_name,
    },
    {
      dataIndex: 'quantity',
      key: 'quantity',
      title: t('Quantity'),
      sorter: true,
      width: '10%',
    },
    {
      dataIndex: 'created_by_name',
      key: 'created_by_name',
      title: t('Created By'),
      width: '20%',
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
          entityId={record.id}
          actionList={ItemConsumptionAction.LIST_ITEM_ACTION}
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

export default React.memo(ItemConsumptionListing)
