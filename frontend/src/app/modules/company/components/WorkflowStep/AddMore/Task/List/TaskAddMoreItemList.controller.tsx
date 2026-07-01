import {useLang} from 'src/app/hooks/useLang'
import {AntModal} from 'src/app/utils'
import {MobileOutlined, PicRightOutlined, PlusOutlined} from '@ant-design/icons'
import {Button, Dropdown, Menu, Space} from 'antd'
import {FC, useEffect, useState} from 'react'
import SendSmsAddMoreItemFormController from '../SendSms/SendSmsAddMoreItemForm.controller'
import UpdateFieldAddMoreItemFormController from '../UpdateField/UpdateFieldAddMoreItemForm.controller'
import TaskAddMoreItemListing from './TaskAddMoreItemList.listing'

interface IProps {
  itemData: any
  addMoreItemList: any
  setAddMoreItemList: any
  [key: string]: any
}

const initialState = {
  entity: {},
  entityIndex: null,
}

const TaskAddMoreItemListController: FC<IProps> = (props) => {
  const {t} = useLang()
  const {
    itemData,
    workflowStepSetupData,
    workflowStepActionList,
    addMoreItemList,
    setAddMoreItemList,
  } = props
  const [entity, setEntity] = useState(initialState.entity)
  const [entityIndex, setEntityIndex] = useState(initialState.entityIndex)
  const [isShowForm, setIsShowForm] = useState(false)
  const [taskKey, setTaskKey] = useState(null)
  const [reloadForm, setReloadForm] = useState<number>(Date.now())
  const [loadingAddMoreItem, setLoadingAddMoreItem] = useState(false)

  useEffect(() => {
    loadData()
  }, [itemData])

  const loadData = (): void => {
    // setLoadingAddMoreItem(true);
  }

  const handleShowForm = () => {
    setIsShowForm(true)
    handleReloadForm()
  }

  const handleHideForm = () => {
    setIsShowForm(false)
    setEntityIndex(null)
  }

  const handleReloadForm = () => {
    setReloadForm(Date.now())
  }

  const handleDeleteConfirm = (itemIndex: number, action: any) => {
    if (action === 'ok') {
      const filteredItems = addMoreItemList.filter((item, index) => index !== itemIndex)
      setAddMoreItemList(filteredItems)
    }
  }

  const handleActions = (action: string, entityIndex?: any) => {
    const record = addMoreItemList[entityIndex]
    setEntity(record)
    if (action === 'add') {
      setEntityIndex(null)
      setIsShowForm(true)
      handleReloadForm()
    } else if (action === 'edit') {
      setEntityIndex(entityIndex)
      setTaskKey(record.task_key)
      setIsShowForm(true)
      handleReloadForm()
    } else if (action === 'delete') {
      AntModal.confirm(
        'Delete Papers To Be Attached',
        'Are you sure you want to delete this Papers To Be Attached?',
        entityIndex,
        handleDeleteConfirm,
        'Delete'
      )
    }
  }

  const handleCallbackFunc = (event: any, action: string, recordId?: any, data?: any) => {
    if (event === null || event === undefined || event === '') {
      event = event ? event : 'singleAction'
    }
    if (event === 'singleAction' && action === 'add') {
      handleActions('add')
    } else if (event === 'singleAction' && action === 'edit') {
      handleActions('edit', recordId)
    } else if (event === 'singleAction' && action === 'delete') {
      handleActions('delete', recordId)
    } else if (event === 'singleAction' && action === 'hideForm') {
      handleHideForm()
    } else if (event === 'singleAction' && action === 'reloadForm') {
      handleReloadForm()
    }
  }

  function handleAddTaskClick(event) {
    setTaskKey(event.key)
    setEntityIndex(null)
    setIsShowForm(true)
    handleReloadForm()
  }

  const menu = (
    <Menu onClick={handleAddTaskClick}>
      <Menu.Item key='SEND_SMS'>
        <MobileOutlined className='me-1' style={{color: 'mediumvioletred'}} /> {t('Send SMS')}
      </Menu.Item>
      <Menu.Item key='UPDATE_FIELD'>
        <PicRightOutlined className='me-1' style={{color: 'green'}} /> {t('Update Fields')}
      </Menu.Item>
    </Menu>
  )

  return (
    <div className='add-more-container'>
      {addMoreItemList?.length > 0 && (
        <TaskAddMoreItemListing
          loadingAddMoreItem={loadingAddMoreItem}
          addMoreItemList={addMoreItemList}
          workflowStepSetupData={workflowStepSetupData}
          workflowStepActionList={workflowStepActionList}
          handleCallbackFunc={handleCallbackFunc}
        />
      )}
      <div className='add-more-action'>
        {taskKey === 'SEND_SMS' && (
          <SendSmsAddMoreItemFormController
            entity={entity}
            entityIndex={entityIndex}
            reloadForm={reloadForm}
            isShowForm={isShowForm}
            workflowStepSetupData={workflowStepSetupData}
            workflowStepActionList={workflowStepActionList}
            addMoreItemList={addMoreItemList}
            setAddMoreItemList={setAddMoreItemList}
            handleCallbackFunc={handleCallbackFunc}
          />
        )}

        {(taskKey === 'UPDATE_FIELD' || taskKey === 'TO_DO') && (
          <UpdateFieldAddMoreItemFormController
            entity={entity}
            entityIndex={entityIndex}
            reloadForm={reloadForm}
            isShowForm={isShowForm}
            workflowStepSetupData={workflowStepSetupData}
            workflowStepActionList={workflowStepActionList}
            addMoreItemList={addMoreItemList}
            setAddMoreItemList={setAddMoreItemList}
            handleCallbackFunc={handleCallbackFunc}
          />
        )}

        <div className='mt-2'>
          <Dropdown overlay={menu}>
            <Button>
              <Space>
                <PlusOutlined /> {t('Add Task')}
              </Space>
            </Button>
          </Dropdown>
        </div>
      </div>
    </div>
  )
}

export default TaskAddMoreItemListController
