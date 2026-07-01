import EditAction from 'src/app/components/Actions/EditAction'
import ListItemAction from 'src/app/components/Actions/ListItemAction'
import AntTable from 'src/app/components/Table/AntTable'
import {useLang} from 'src/app/hooks/useLang'
import {EditOutlined, MobileOutlined, PicRightOutlined} from '@ant-design/icons'
import Tooltip from 'antd/es/tooltip'
import React, {FC} from 'react'
import {WorkflowStepAction} from '../Actions/WorkflowStep.actions'

const WorkflowStepListing: FC<any> = (props) => {
  const {t} = useLang()
  const {
    loading,
    listData,
    selectedRowKeys,
    workflowStepSetupData,
    handleOnChanged,
    handleTableChange,
    handleCallbackFunc,
  } = props
  const columns = [
    {
      dataIndex: 'sort_order',
      key: 'sort_order',
      title: t('Sequence'),
      width: '5%',
      render: (text: string, record: any, index: number) => {
        return (
          <span className='d-inline-block bg-primary rounded-pill px-2 text-white'>{text}</span>
        )
      },
    },
    {
      dataIndex: 'step_name',
      key: 'step_name',
      title: t('Step Name'),
      align: 'left',
      width: '20%',
      render: (text: string, record: any, index: number) => {
        return (
          <EditAction
            entityId={record.id}
            actionItem={WorkflowStepAction.COMMON_ACTION.EDIT}
            defaultViewText={text}
            handleCallbackFunc={handleCallbackFunc}
          >
            <strong style={{cursor: 'pointer'}}>
              <EditOutlined /> {text}
            </strong>
          </EditAction>
        )
      },
    },
    {
      dataIndex: 'step_type',
      key: 'step_type',
      title: t('Step Type'),
      width: '15%',
      render: (text: string, record: any, index: number) => {
        const stepTypeInfo = workflowStepSetupData?.STEP_INFO.STEP_TYPE.options.find(
          (item) => item.value === text
        )
        return stepTypeInfo?.label || text
      },
    },
    {
      dataIndex: 'step_conditions',
      key: 'step_conditions',
      title: t('Conditions'),
      align: 'center',
      width: '10%',
      render: (text: string, record: any, index: number) => {
        return (
          <small className='d-inline-block border border-info rounded-pill px-2'>
            {record.pre_conditions.length}
          </small>
        )
      },
    },
    {
      dataIndex: 'step_approvers',
      key: 'step_approvers',
      title: t('Approvers'),
      align: 'center',
      width: '10%',
      render: (text: string, record: any, index: number) => {
        return (
          <small className='d-inline-block border border-info rounded-pill px-2'>
            {record.step_approvers.length}
          </small>
        )
      },
    },
    {
      dataIndex: 'step_actions',
      key: 'step_actions',
      title: t('Actions'),
      align: 'center',
      width: '10%',
      render: (text: string, record: any, index: number) => {
        return (
          <small className='d-inline-block border border-info rounded-pill px-2'>
            {record.actions.length}
          </small>
        )
      },
    },
    {
      dataIndex: 'step_tasks',
      key: 'step_tasks',
      title: t('Tasks'),
      align: 'center',
      width: '10%',
      render: (text: string, record: any, index: number) => {
        return (
          <>
            <small className='d-inline-block border border-info rounded-pill px-2'>
              {record.tasks.length}
            </small>
            {record.tasks.length ? (
              <>
                <br />
                {record.tasks.map((item) => {
                  const taskTitle = item.task_key?.replaceAll('_', ' ')

                  if ('SEND_SMS' === item.task_key)
                    return (
                      <Tooltip title={taskTitle}>
                        <MobileOutlined className='ms-1' style={{color: 'mediumvioletred'}} />
                      </Tooltip>
                    )

                  if ('UPDATE_FIELD' === item.task_key)
                    return (
                      <Tooltip title={taskTitle}>
                        <PicRightOutlined className='ms-1' style={{color: 'green'}} />
                      </Tooltip>
                    )
                })}
              </>
            ) : null}
          </>
        )
      },
    },
    {
      dataIndex: 'status',
      key: 'status',
      title: t('Status'),
      align: 'center',
      width: '10%',
      render: (text: string, record: any, index: number) => text,
    },
    {
      dataIndex: 'action',
      key: 'action',
      title: t('Action'),
      align: 'center',
      width: '10%',
      render: (text: string, record: any, index: number) => (
        <ListItemAction
          entityId={record.id}
          actionList={WorkflowStepAction.LIST_ITEM_ACTION}
          handleCallbackFunc={handleCallbackFunc}
        />
      ),
    },
  ]

  return (
    <div className='listing-page-content listing-page-content-approvalStep'>
      <AntTable
        className='table-layout'
        rowSelection={false}
        rowSelectionPermission={WorkflowStepAction.BULK_ACTION.permission}
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

export default React.memo(WorkflowStepListing)
