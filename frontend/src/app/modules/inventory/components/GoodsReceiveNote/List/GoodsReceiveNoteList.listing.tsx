import React, {FC} from 'react'
import ListItemAction from 'src/app/components/Actions/ListItemAction'
import ViewAction from 'src/app/components/Actions/ViewAction'
import AntTable from 'src/app/components/Table/AntTable'
import {GoodsReceiveNoteAction} from '../Actions/GoodsReceiveNote.actions'
import {DateTimeUtils} from 'src/app/utils'
import {useLang} from 'src/app/hooks/useLang'

const GoodsReceiveNoteListing: FC<any> = (props) => {
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
    if (
      actionItemInfo.title === 'Edit' &&
      ['SUBMITTED', 'REJECTED', 'APPROVED'].includes(recordItemInfo.process_status)
    ) {
      return false
    }
    if (
      actionItemInfo.title === 'Delete' &&
      ['SUBMITTED', 'BACKWARD_INITIATION', 'REJECTED', 'APPROVED'].includes(
        recordItemInfo.process_status
      )
    ) {
      return false
    }
    return true
  }

  const columns = [
    {
      dataIndex: 'grn_number',
      key: 'grn_number',
      title: t('GRN Number'),
      sorter: true,
      width: '15%',
      render: (text: string, record: any, index: number) => (
        <ViewAction
          entityId={record.id}
          actionItem={GoodsReceiveNoteAction.COMMON_ACTION.VIEW}
          defaultViewText={text}
          handleCallbackFunc={handleCallbackFunc}
        >
          <span className='grid-row-view-action fw-bolder cursor-pointer'>{text}</span>
        </ViewAction>
      ),
    },
    {
      dataIndex: 'ref_po_number',
      key: 'ref_po_number',
      title: t('Ref. Purchase Number'),
      sorter: true,
      width: '10%',
    },
    {
      dataIndex: 'ref_challan_no',
      key: 'ref_challan_no',
      title: t('Ref. Challan Number'),
      sorter: true,
      width: '10%',
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
      dataIndex: 'process_status',
      key: 'process_status',
      title: t('Status'),
      sorter: true,
      width: '10%',
    },
    {
      dataIndex: 'created_by',
      key: 'created_by',
      title: t('Created By'),
      width: '10%',
      sorter: true,
      render: (text: string, record: any, index: number) => record.created_by_name,
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
          actionList={GoodsReceiveNoteAction.LIST_ITEM_ACTION}
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

export default React.memo(GoodsReceiveNoteListing)
