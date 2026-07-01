import React, {FC, useEffect, useState} from 'react'
import {Timeline, Spin, Divider} from 'antd'
import {useErrorHandler} from 'src/app/hooks/useErrorHandler'
import {WorkflowTransitionApi} from 'src/app/api'
import {DateTimeUtils} from 'src/app/utils'

interface IProps {
  workflowId: any
  workflowRecordId: any
  [key: string]: any
}

const WorkflowActivityTimeline: FC<IProps> = (props) => {
  const {workflowRecordId, workflowId} = props

  const [listData, setListData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const {handleErrorMessage, handleSuccessMessage, showErrorMessage} = useErrorHandler()

  useEffect(() => {
    if (workflowRecordId && workflowId) {
      loadData()
    }
  }, [workflowRecordId, workflowId])

  const loadData = (): void => {
    setLoading(true)
    const payload = {
      $filter: `workflow_record_id='${workflowRecordId}' AND workflow_id='${workflowId}' AND status=true`,
      $orderby: 'created_at desc',
    }
    WorkflowTransitionApi.list(payload)
      .then((res) => {
        setListData(res.data.results)
        setLoading(false)
      })
      .catch((err) => {
        handleErrorMessage(err)
        setLoading(false)
      })
  }

  return (
    <div className='view-page-content-right activity-timeline'>
      <Divider orientation='center'>{'Activity Log'}</Divider>
      <Spin spinning={loading}>
        <Timeline mode='left'>
          {listData?.map((item, index) => (
            <>
              <Timeline.Item color='red' key={`transition-${index}`}>
                <b>{item.workflow_action_alias_text || item.workflow_action_name}</b>
                <p>
                  by {item.created_by_name} at {DateTimeUtils.formatDateTimeA(item.created_at)}
                </p>
                <blockquote className='comment'>Comment: {item.comment || ''}</blockquote>
              </Timeline.Item>
            </>
          ))}
        </Timeline>
      </Spin>
    </div>
  )
}

export default WorkflowActivityTimeline
