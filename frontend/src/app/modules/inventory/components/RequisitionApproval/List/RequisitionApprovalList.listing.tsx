import React, {FC} from 'react'
import ListItemAction from 'src/app/components/Actions/ListItemAction'
import ViewAction from 'src/app/components/Actions/ViewAction'
import AntTable from 'src/app/components/Table/AntTable'
import {RequisitionApprovalAction} from '../Actions/RequisitionApproval.actions'
import {CommonUtils} from 'src/app/utils'
import {useLang} from 'src/app/hooks/useLang'

const RequisitionApprovalListing: FC<any> = (props) => {
  const {
    loading,
    listData,
    selectedRowKeys,
    onChangeSwitchToggle,
    handleOnChanged,
    handleTableChange,
    handleCallbackFunc,
  } = props
  const {t} = useLang()

  // const {workflowData, workflowLoading, workflowActiveStep, activeStepActionList} = props

  const columns = [
    {
      dataIndex: 'requisition_number',
      key: 'requisition_number',
      title: t('Req. Number'),
      sorter: true,
      width: '10%',
      render: (text: string, record: any, index: number) => (
        <ViewAction
          entityId={record.id}
          actionItem={RequisitionApprovalAction.COMMON_ACTION.VIEW}
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
      title: t('Requisition Subject'),
      sorter: true,
      width: '30%',
    },
    {
      dataIndex: 'branch_name',
      key: 'branch_name',
      title: t('DMP Unit'),
      width: '20%',
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
      width: '20%',
    },
    {
      dataIndex: 'process_status',
      key: 'process_status',
      title: t('Process Status'),
      width: '20%',
      render: (text: string, record: any, index: number) => {
        if (text === 'REJECTED') {
          return <span className='badge badge-danger'>{text}</span>
        } else if (text === 'ACKNOWLEDGED') {
          return <span className='badge badge-success'>{text}</span>
        } else {
          return <span className='badge badge-warning'>{text}</span>
        }
      },
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
          actionList={RequisitionApprovalAction.LIST_ITEM_ACTION}
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

export default React.memo(RequisitionApprovalListing)
