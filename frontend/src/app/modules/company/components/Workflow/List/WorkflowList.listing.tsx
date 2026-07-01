import React, {FC} from 'react'
import ListItemAction from 'src/app/components/Actions/ListItemAction'
import ViewAction from 'src/app/components/Actions/ViewAction'
import AntTable from 'src/app/components/Table/AntTable'
import {useLang} from 'src/app/hooks/useLang'
import {CommonUtils} from 'src/app/utils'
import {WorkflowAction} from '../Actions/Workflow.actions'

const WorkflowListing: FC<any> = (props) => {
  const {t} = useLang()
  const {
    loading,
    listData,
    selectedRowKeys,
    onChangeSwitchToggle,
    handleOnChanged,
    handleTableChange,
    handleCallbackFunc,
  } = props
  const columns = [
    {
      dataIndex: 'workflow_name',
      key: 'workflow_name',
      title: t('Name'),
      sorter: true,
      width: '35%',
      render: (text: string, record: any, index: number) => (
        <ViewAction
          entityId={record.id}
          actionItem={WorkflowAction.COMMON_ACTION.VIEW}
          defaultViewText={text}
          handleCallbackFunc={handleCallbackFunc}
        >
          <span className='grid-row-view-action fw-bolder cursor-pointer'>{text}</span>
        </ViewAction>
      ),
    },
    {
      dataIndex: 'workflow_code',
      key: 'workflow_code',
      title: t('Code'),
      width: '30%',
    },
    {
      dataIndex: 'total_steps',
      key: 'total_steps',
      title: t('Steps'),
      align: 'center',
      width: '25%',
      render: (text: string, record: any, index: number) => {
        return <span className='d-inline-block border border-info rounded-pill px-2'>{text}</span>
      },
    },
    {
      dataIndex: 'status',
      key: 'status',
      title: t('Status'),
      sorter: true,
      width: '30%',
      render: (text: string, record: any, index: number) =>
        CommonUtils.displaySwitchToggleBtn(record, record.status, onChangeSwitchToggle),
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
          actionList={WorkflowAction.LIST_ITEM_ACTION}
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
        rowSelectionPermission={WorkflowAction.BULK_ACTION.permission}
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

export default React.memo(WorkflowListing)
