import React, { FC, Fragment } from 'react';
import { Form, Input, Row, Col, Select, Collapse, InputNumber } from 'antd';
import { EnumUtils } from 'src/app/utils';
import { StatusEnum } from 'src/app/utils/enums';
import { useLang } from 'src/app/hooks/useLang';
import WorkflowStepConditionAddMore from '../AddMore/Condition/WorkflowStepCondition.addMore';
import ApproverAddMoreItemListController from '../AddMore/Approver/List/ApproverAddMoreItemList.controller';
import UserActionAddMoreItemListController from '../AddMore/UserAction/List/UserActionAddMoreItemList.controller';
import TaskAddMoreItemListController from '../AddMore/Task/List/TaskAddMoreItemList.controller';
// import ApproverAddMoreItemListController from '../AddMore/Approver/List/ApproverAddMoreItemList.controller'

const AddOrEditForm: FC<any> = (props) => {
  const { Panel } = Collapse;
  const { Option } = Select;
  const { TextArea } = Input;
  const { t } = useLang();
  const {
    formRef,
    initialValues,
    itemData,
    workflowStepSetupData,
    workflowStepConditionList,
    setWorkflowStepConditionList,
    workflowStepApproverList,
    setWorkflowStepApproverList,
    workflowStepActionList,
    setWorkflowStepActionList,
    workflowStepTaskList,
    setWorkflowStepTaskList,
    handleChange,
    handleSubmit,
    handleSubmitFailed,
  } = props;

  return (
    <Fragment>
      <div className="form-page-content form-page-content-approvalStep">
        <Form
          layout="vertical"
          form={formRef}
          name="approvalStepForm"
          scrollToFirstError={true}
          initialValues={initialValues}
          onValuesChange={handleChange}
          onFinish={handleSubmit}
          onFinishFailed={handleSubmitFailed}
        >
          <Row>
            <Col xs={24} md={24}>
              <Collapse defaultActiveKey={[1]} expandIconPosition="left">
                <Panel key="1" header={t('Step Info')}>
                  <div className="collapse-panel-content">
                    <Row gutter={[16, 16]}>
                      <Col span={24}>
                        <Form.Item label={t('Step Name')} name="step_name">
                          <Input />
                        </Form.Item>

                        <Form.Item label={t('Step Type')} name="step_type">
                          <Select placeholder={t('Select')}>
                            {workflowStepSetupData?.STEP_INFO.STEP_TYPE.options.map(
                              (item, index) => (
                                <Option
                                  key={`step-type-${index}`}
                                  value={item.value}
                                >
                                  {item.label}
                                </Option>
                              )
                            )}
                          </Select>
                        </Form.Item>

                        <Form.Item
                          label={t('Step Sequence')}
                          name="sort_order"
                          rules={[
                            {
                              required: true,
                              message: 'This field is required.',
                            },
                          ]}
                        >
                          <InputNumber style={{ width: '200px' }} min={1} />
                        </Form.Item>
                      </Col>
                    </Row>
                  </div>
                </Panel>

                <Panel key="3" header={t('Preconditions')}>
                  <div className="collapse-panel-content">
                    <Row gutter={[16, 16]}>
                      <Col span={24}>
                        <p>
                          {t(
                            "Step's Data List will appear by matching these conditions."
                          )}
                        </p>
                        <div className={'condition-add-more-content'}>
                          <WorkflowStepConditionAddMore
                            workflowStepSetupData={workflowStepSetupData}
                            addMoreItemList={workflowStepConditionList}
                            setAddMoreItemList={setWorkflowStepConditionList}
                          />
                        </div>
                      </Col>
                    </Row>
                  </div>
                </Panel>

                <Panel key="4" header={t('Approvers')}>
                  <div className="collapse-panel-content">
                    <Row gutter={[16, 16]}>
                      <Col span={24}>
                        <div className={'approver-add-more-content'}>
                          <ApproverAddMoreItemListController
                            itemData={itemData}
                            workflowStepSetupData={workflowStepSetupData}
                            addMoreItemList={workflowStepApproverList}
                            setAddMoreItemList={setWorkflowStepApproverList}
                          />
                        </div>
                      </Col>
                    </Row>
                  </div>
                </Panel>

                <Panel key="5" header={t('Actions')}>
                  <div className="collapse-panel-content">
                    <Row gutter={[16, 16]}>
                      <Col span={24}>
                        <p>
                          {t('These actions will be available for the users.')}
                        </p>
                        <div className={'action-add-more-content'}>
                          <UserActionAddMoreItemListController
                            itemData={itemData}
                            workflowStepSetupData={workflowStepSetupData}
                            addMoreItemList={workflowStepActionList}
                            setAddMoreItemList={setWorkflowStepActionList}
                            stepLists={props.stepLists}
                          />
                        </div>
                      </Col>
                    </Row>
                  </div>
                </Panel>

                <Panel key="6" header={t('Tasks')}>
                  <div className="collapse-panel-content">
                    <Row gutter={[16, 16]}>
                      <Col span={24}>
                        <p>
                          {t(
                            'Immediate tasks can be set as per your business needs.'
                          )}
                        </p>
                        <div className={'task-add-more-content'}>
                          <TaskAddMoreItemListController
                            itemData={itemData}
                            workflowStepSetupData={workflowStepSetupData}
                            workflowStepActionList={workflowStepActionList}
                            addMoreItemList={workflowStepTaskList}
                            setAddMoreItemList={setWorkflowStepTaskList}
                          />
                        </div>
                      </Col>
                    </Row>
                  </div>
                </Panel>
              </Collapse>
            </Col>
          </Row>
        </Form>
      </div>
    </Fragment>
  );
};
export default React.memo(AddOrEditForm);
