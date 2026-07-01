import React, {FC} from 'react'
import ListItemAction from 'src/app/components/Actions/ListItemAction'
import ViewAction from 'src/app/components/Actions/ViewAction'
import AntTable from 'src/app/components/Table/AntTable'
import {GoodsReceiveNoteApprovalAction} from '../Actions/GoodsReceiveNoteApproval.actions'
import {useLang} from 'src/app/hooks/useLang'

const GoodsReceiveNoteApprovalListing: FC<any> = (props) => {
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
    if (actionItemInfo.title === 'Edit' && ['SUBMITTED'].includes(recordItemInfo.process_status)) {
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
      width: '20%',
      render: (text: string, record: any, index: number) => (
        <ViewAction
          entityId={record.id}
          actionItem={GoodsReceiveNoteApprovalAction.COMMON_ACTION.VIEW}
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
      title: t('Reference Purchase Number'),
      sorter: true,
      width: '15%',
    },
    {
      dataIndex: 'ref_challan_no',
      key: 'ref_challan_no',
      title: t('Reference Challan Number'),
      sorter: true,
      width: '15%',
    },
    {
      dataIndex: 'branch_name',
      key: 'branch_name',
      title: t('Branch'),
      sorter: false,
      width: '15%',
    },
    {
      dataIndex: 'process_status',
      key: 'process_status',
      title: t('Status'),
      sorter: true,
      width: '10%',
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
      width: '10%',
      align: 'center',
      render: (text: string, record: any, index: number) => (
        <ListItemAction
          entity={record}
          entityId={record.id}
          actionList={GoodsReceiveNoteApprovalAction.LIST_ITEM_ACTION}
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

export default React.memo(GoodsReceiveNoteApprovalListing)
