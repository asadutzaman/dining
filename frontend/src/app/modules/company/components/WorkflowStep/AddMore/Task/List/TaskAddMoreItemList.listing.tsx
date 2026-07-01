import ListMoreItemAction from 'src/app/components/Actions/ListMoreItemAction'
import {useLang} from 'src/app/hooks/useLang'
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
  CommentOutlined,
  DeliveredProcedureOutlined,
  DoubleLeftOutlined,
  EyeOutlined,
  FileSearchOutlined,
  MinusCircleOutlined,
  MobileOutlined,
  PicRightOutlined,
  UserOutlined,
} from '@ant-design/icons'
import {Table} from 'antd'
import {FC} from 'react'
import {renderToString} from 'react-dom/server'
import {TaskAddMoreItemActions} from '../Actions/TaskAddMoreItem.actions'

const TaskAddMoreItemListing: FC<any> = (props) => {
  const {t} = useLang()
  const {
    loadingAddMoreItem,
    addMoreItemList,
    workflowStepSetupData,
    workflowStepActionList,
    handleCallbackFunc,
  } = props
  const columns = [
    {
      dataIndex: 'action_code',
      key: 'action_code',
      title: t('Action'),
      render: (text: string, record: any, index: number) => {
        const actionInfo = workflowStepActionList.find((item) => item.action_code === text)
        return (
          <div style={{lineHeight: '16px'}}>
            {taskActionNameWithIcon(record.action_code)}
            <br />
            {actionInfo?.action_alias_text || text}
          </div>
        )
      },
    },
    {
      dataIndex: 'task_type',
      key: 'task_type',
      title: t('Task Type'),
      render: (text: string, record: any, index: number) => {
        let htmlText: string = ''

        if (record.task_key === 'UPDATE_FIELD' || record.task_key === 'TO_DO') {
          htmlText +=
            renderToString(<PicRightOutlined className='ms-1' style={{color: 'green'}} />) +
            ` ${record?.task_type}`
        } else if (record.task_key === 'SEND_SMS') {
          htmlText +=
            renderToString(<MobileOutlined className='ms-1' style={{color: 'mediumvioletred'}} />) +
            ` ${record?.task_type}`
        }

        return <div dangerouslySetInnerHTML={{__html: htmlText}} />
      },
    },
    {
      dataIndex: 'task_name',
      key: 'task_name',
      title: t('Task Name'),
    },
    {
      dataIndex: 'task_key',
      key: 'task_key',
      title: t('Task Details'),
      render: (text: string, record: any, index: number) => {
        let htmlText: string = ''

        if (record.task_key === 'UPDATE_FIELD' || record.task_key === 'TO_DO') {
          const fieldValueInfo = workflowStepSetupData.TASK.FIELD_VALUE.options.find(
            (item) => item.value === record.field_value
          )
          htmlText += `${record?.field_name?.toUpperCase()}: <strong>${
            fieldValueInfo?.label || record?.field_value
          }</strong>`
        } else if (record.task_key === 'SEND_SMS') {
          htmlText +=
            renderToString(<UserOutlined className='text-muted' />) +
            ` <small><strong class="d-inline-block border border-info rounded-pill px-2">${
              record?.recipientList?.length
            }</strong></small><br/><span style="color:#888">${record?.message?.substring(0, 50)}${
              record?.message?.length > 50 ? '...' : ''
            }</span>`
        }

        return <div dangerouslySetInnerHTML={{__html: htmlText}} />
      },
    },
    {
      dataIndex: 'action',
      key: 'action',
      title: t('Action'),
      render: (text: string, record: any, index: number) => (
        <ListMoreItemAction
          entityIndex={index}
          actionList={TaskAddMoreItemActions.LIST_ITEM_ACTION}
          handleCallbackFunc={handleCallbackFunc}
        />
      ),
    },
  ]

  return (
    <div className='listing-content'>
      <Table
        className='table-layout'
        rowKey={(record, index) =>
          index === undefined ? Math.random().toString() : index.toString()
        }
        rowClassName={(record, index) => (index % 2 === 0 ? 'odd' : 'even')}
        dataSource={addMoreItemList}
        columns={columns}
        pagination={false}
        loading={loadingAddMoreItem}
        bordered={false}
      />
    </div>
  )
}

export default TaskAddMoreItemListing

const taskActionNameWithIcon = (actionName) => {
  const actionLabel = actionName?.replaceAll('_', ' ')

  switch (actionName) {
    case 'DELEGATE':
      return (
        <small className='text-primary'>
          {actionLabel} <ArrowRightOutlined />
        </small>
      )

    case 'APPROVE':
      return (
        <small className='text-success'>
          <CheckCircleOutlined /> {actionLabel}
        </small>
      )

    case 'REJECT':
      return (
        <small className='text-danger'>
          <MinusCircleOutlined /> {actionLabel}
        </small>
      )

    case 'REVISE':
      return (
        <small style={{color: 'purple'}}>
          <FileSearchOutlined /> {actionLabel}
        </small>
      )

    case 'SEND_BACK':
      return (
        <small style={{color: 'coral'}}>
          <ArrowLeftOutlined /> {actionLabel}
        </small>
      )

    case 'DISBURSE':
      return (
        <small style={{color: 'purple'}}>
          <DeliveredProcedureOutlined /> {actionLabel}
        </small>
      )

    default:
      return <small>{actionLabel}</small>
  }
}
