import {useLang} from 'src/app/hooks/useLang'
import {AntModal} from 'src/app/utils'
import {PlusOutlined} from '@ant-design/icons'
import {Button, Col, Form, Radio, Row} from 'antd'
import {FC, useEffect, useState} from 'react'
import ApproverAddMoreItemFormController from '../Form/ApproverAddMoreItemForm.controller'
import ApproverAddMoreItemListing from './ApproverAddMoreItemList.listing'

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

const ApproverAddMoreItemListController: FC<IProps> = (props) => {
  const {t} = useLang()
  const {itemData, workflowStepSetupData, addMoreItemList, setAddMoreItemList} = props
  const [entity, setEntity] = useState(initialState.entity)
  const [entityIndex, setEntityIndex] = useState(initialState.entityIndex)
  const [isShowForm, setIsShowForm] = useState(false)
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

  function handleClickAddUserAction() {
    handleCallbackFunc(null, 'add')
    setEntityIndex(null)
    setIsShowForm(true)
    handleReloadForm()
  }

  return (
    <div className='add-more-container add-more-papers-to-be-attached-container'>
      <Row>
        <Col span={24}>
          {addMoreItemList?.length > 0 && (
            <ApproverAddMoreItemListing
              loadingAddMoreItem={loadingAddMoreItem}
              addMoreItemList={addMoreItemList}
              workflowStepSetupData={workflowStepSetupData}
              handleCallbackFunc={handleCallbackFunc}
            />
          )}
          <div className='add-more-action' style={{marginTop: 15, marginBottom: 10}}>
            <ApproverAddMoreItemFormController
              entity={entity}
              entityIndex={entityIndex}
              reloadForm={reloadForm}
              isShowForm={isShowForm}
              workflowStepSetupData={workflowStepSetupData}
              addMoreItemList={addMoreItemList}
              setAddMoreItemList={setAddMoreItemList}
              handleCallbackFunc={handleCallbackFunc}
            />
            <Button
              type='default'
              className='border-primary'
              onClick={() => handleClickAddUserAction()}
            >
              <PlusOutlined />
              {t('Add Approver')}
            </Button>
          </div>
          {/* <div className={'approver-settings'} style={{paddingTop: 5}}>
            <h3>Approval Policy</h3>
            <Form.Item name='approval_policy_type'>
              <Radio.Group>
                <ul>
                  <li>
                    <Radio value={'ANYONE_APPROVE'}>Anyone of the approver(s) can approve</Radio>
                  </li>
                  <li>
                    <Radio value={'ALL_APPROVER_APPROVE'}>All approver(s) must approve</Radio>
                  </li>
                  <li>
                    <Radio value={'ALL_APPROVER_SEQUENTIALLY_APPROVE'}>
                      All approver(s) must approve in sequence
                    </Radio>
                  </li>
                </ul>
              </Radio.Group>
            </Form.Item>

            <h3 style={{paddingTop: 15}}>Select Approver</h3>
            <Form.Item name='approver_select_type'>
              <Radio.Group>
                <ul>
                  <li>
                    <Radio value={'ASSIGN_SINGLE_APPROVER'}>Manually assign to approver</Radio>
                  </li>
                  <li>
                    <Radio value={'ASSIGN_MULTIPLE_APPROVER'}>
                      Manually assign to multiple approver(s)
                    </Radio>
                  </li>
                  <li>
                    <Radio value={'AUTOMATICALLY_ASSIGN_APPROVER'}>
                      Automatically assign to approver(s)
                    </Radio>
                  </li>
                </ul>
              </Radio.Group>
            </Form.Item>
          </div> */}
        </Col>
      </Row>
    </div>
  )
}

export default ApproverAddMoreItemListController
