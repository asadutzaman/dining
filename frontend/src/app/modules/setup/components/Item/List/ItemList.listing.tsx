import React, {FC} from 'react'
import ListItemAction from 'src/app/components/Actions/ListItemAction'
import ViewAction from 'src/app/components/Actions/ViewAction'
import AntTable from 'src/app/components/Table/AntTable'
import {ItemAction} from '../Actions/Item.actions'
import {useLang} from 'src/app/hooks/useLang'
import {DateTimeUtils} from 'src/app/utils'

const ItemListing: FC<any> = (props) => {
  const {
    loading,
    listData,
    selectedRowKeys,
    onChangeSwitchToggle,
    handleOnChanged,
    handleTableChange,
    handleCallbackFunc,
  } = props
  const {t, lang} = useLang()

  const columns = [
    {
      dataIndex: 'name_en',
      key: 'name_en',
      title: t('Item Name'),
      sorter: true,
      width: '20%',
      render: (text: string, record: any, index: number) => (
        <ViewAction
          entityId={record.id}
          actionItem={ItemAction.COMMON_ACTION.VIEW}
          defaultViewText={text}
          handleCallbackFunc={handleCallbackFunc}
        >
          <span className='grid-row-view-action fw-bolder cursor-pointer'>{`[${record.code}]-${
            lang === 'en' ? record.name_en : record.name_bn
          }`}</span>
        </ViewAction>
      ),
    },
    {
      dataIndex: 'type',
      key: 'type',
      title: t('Type'),
      sorter: true,
      width: '10%',
    },
    {
      dataIndex: 'logistic_id',
      key: 'logistic_id',
      title: t('Logistic Name'),
      sorter: true,
      width: '10%',
      render: (text: number, record: any, index: number) => record.logistic_name,
    },
    {
      dataIndex: 'item_category_id',
      key: 'item_category_id',
      title: t('Category Name'),
      sorter: true,
      width: '10%',
      render: (text: string, record: any, index: number) => record.item_category_name,
    },
    {
      dataIndex: 'brand_name',
      key: 'brand_name',
      title: t('Brand Name'),
      sorter: false,
      width: '10%',
    },
    {
      dataIndex: 'base_unit_sort_name',
      key: 'base_unit_sort_name',
      title: t('Unit Name'),
      sorter: false,
      width: '5%',
    },
    {
      dataIndex: 'reorder_qty',
      key: 'reorder_qty',
      title: t('Reorder Qty'),
      sorter: true,
      width: '5%',
    },
    {
      dataIndex: 'created_by_name',
      key: 'created_by_name',
      title: t('Created By'),
      width: '10%',
      sorter: false,
    },
    {
      dataIndex: 'created_at',
      key: 'created_at',
      title: t('Created Time'),
      sorter: true,
      width: '5%',
      render: (value: any) => DateTimeUtils.formatDateTimeA(value),
    },
    {
      dataIndex: 'updated_at',
      key: 'updated_at',
      title: t('Updated Time'),
      sorter: true,
      width: '5%',
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
          actionList={ItemAction.LIST_ITEM_ACTION}
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
        rowSelectionPermission='auth:item:multiSelect'
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

export default React.memo(ItemListing)
