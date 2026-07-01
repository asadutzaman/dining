import React, {FC, useContext} from 'react'
import ListItemAction from 'src/app/components/Actions/ListItemAction'
import ViewAction from 'src/app/components/Actions/ViewAction'
import AntTable from 'src/app/components/Table/AntTable'
import {RequisitionAction} from '../Actions/Requisition.actions'
import {CommonUtils, DateTimeUtils} from 'src/app/utils'
import ModalAction from 'src/app/components/Actions/ModalAction'
import {ModalFormType} from '../ModalFormType.enum'
import {AuthContext} from 'src/app/context/auth/auth.context'
import {useLang} from 'src/app/hooks/useLang'

const RequisitionListing: FC<any> = (props) => {
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
      dataIndex: 'requisition_number',
      key: 'requisition_number',
      title: t('Requisition No'),
      sorter: true,
      width: '10%',
      render: (text: string, record: any, index: number) => (
        <ViewAction
          entityId={record.id}
          actionItem={RequisitionAction.COMMON_ACTION.VIEW}
          defaultViewText={text}
          handleCallbackFunc={handleCallbackFunc}
        >
          <span className='grid-row-view-action fw-bolder cursor-pointer'>{text}</span>
        </ViewAction>
      ),
    },
    {
      dataIndex: 'subject',
      key: 'subject',
      title: t('Subject'),
      sorter: false,
      width: '20%',
    },
    {
      dataIndex: 'branch_id',
      key: 'branch_id',
      title: t('Branch'),
      sorter: true,
      width: '20%',
      render: (text: number, record: any, index: number) => record.branch_name,
    },
    {
      dataIndex: 'description',
      key: 'description',
      title: t('Description'),
      sorter: false,
      width: '20%',
    },
    {
      dataIndex: 'process_status',
      key: 'process_status',
      title: t('Process Status'),
      sorter: true,
      width: '15%',
      render: (text: number, record: any, index: number) => {
        if (record.process_status === 'DISBURSED' && userId === record.created_by) {
          return (
            <ModalAction
              entityId={record.id}
              className={'btn-warning'}
              btnText={'Pending'}
              actionItem={RequisitionAction.COMMON_ACTION.REQUEST_ACKNOWLEDGEMENT}
              modalNameList={{}}
              whichModal={ModalFormType.REQUEST_ACKNOWLEDGEMENT}
              handleCallbackFunc={handleCallbackFunc}
              enablePermission={true}
            />
          )
        } else {
          return text
        }
      },
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
      width: '5%',
      align: 'center',
      render: (text: string, record: any, index: number) => (
        <ListItemAction
          entity={record}
          entityId={record.id}
          actionList={RequisitionAction.LIST_ITEM_ACTION}
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

export default React.memo(RequisitionListing)
