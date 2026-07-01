import React, {FC} from 'react'
import {DateTimeUtils} from 'src/app/utils'
import EditAction from 'src/app/components/Actions/EditAction'
import DeleteAction from 'src/app/components/Actions/DeleteAction'
import {WorkflowAction} from '../Actions/Workflow.actions'
import {StatusEnum} from 'src/app/utils/enums'
import {useLang} from 'src/app/hooks/useLang'
import WorkflowTabSteps from '../Tabs/WorkflowTab.steps'

const WorkflowView: FC<any> = (props) => {
  const {t} = useLang()
  const {itemData, handleCallbackFunc} = props

  return (
    <div className='card card-body position-relative'>
      <div className='table-responsive'>
        <table className='table table-row-dashed table-row-gray-300 align-middle gs-0 gy-1'>
          <tr>
            <td width={'20%'}>{t('Workflow Name')}</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>{itemData.workflow_name}</td>
          </tr>
          <tr>
            <td width={'20%'}>{t('Status')}</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>{StatusEnum[itemData.status]}</td>
          </tr>
        </table>
      </div>
      <WorkflowTabSteps workflowInfo={itemData} />
    </div>
  )
}
export default React.memo(WorkflowView)
