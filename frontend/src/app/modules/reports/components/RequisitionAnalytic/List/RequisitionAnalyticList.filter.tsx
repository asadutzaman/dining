import React, {FC} from 'react'
import {Button, Select, Form, Input, Row, Col, Collapse, Spin} from 'antd'
import PrintOpenModal from 'src/app/components/Print/PrintOpenModal'
import {rules} from 'src/app/components/Validation/Form.validate'
import {RefreshIcon, ResetIcon} from 'src/_metronic/assets/images/icon/svg'
import BranchSelect from 'src/app/components/Dropdown/BranchSelect'
import {useLang} from 'src/app/hooks/useLang'
import {LogisticSelect, UserSelect} from 'src/app/components/Dropdown'
import LogisticGridSelect from 'src/app/components/Dropdown/LogisticGridSelect'

const RequisitionAnalyticListFilter: FC<any> = (props) => {
  const {Panel} = Collapse
  const {Option} = Select
  const {
    ListingComponent,
    formRef,
    initialValues,
    exportLoading,
    handleChange,
    handleSubmit,
    setIsSubmitted,
    setIsExportSubmitted,
    filters,
    params,
    handleOnChanged,
    handleCallbackFunc,
    workflowSteps,
    workflowLoading,
    ...restProps
  } = props
  const {t} = useLang()

  const onSubmit = (submitType: any) => {
    if (submitType === 'preview') {
      setIsExportSubmitted(false)
      setIsSubmitted(true)
    } else if (submitType === 'export') {
      setIsSubmitted(false)
      setIsExportSubmitted(true)
    }
    formRef.submit()
  }

  return (
    <div className='p-6'>
      <Collapse defaultActiveKey={['1']}>
        <Panel header={t('Requisition Analytic Filter')} key='1'>
          <Form
            layout='vertical'
            form={formRef}
            name='exampleForm'
            scrollToFirstError={true}
            initialValues={initialValues}
            onValuesChange={handleChange}
            onFinish={handleSubmit}
          >
            <Row gutter={[16, 16]}>
              <Col span={6}>
                <Form.Item name='step_code' label={t('Approval Step')}>
                  <Select allowClear={true} placeholder={t('Select Approval Step')}>
                    <>
                      <Option key={`approval-step-pending`} value={'ALL'}>
                        {t('All')}
                      </Option>
                      <Option key={`approval-step-pending`} value={'PENDING'}>
                        {t('Pending')}
                      </Option>
                      <Option key={`approval-step-rejected`} value={'REJECTED'}>
                        {t('Rejected')}
                      </Option>
                      <Option key={`approval-step-approved`} value={'APPROVED'}>
                        {t('Approved')}
                      </Option>
                      <Option key={`approval-step-disbursed`} value={'DISBURSED'}>
                        {t('Disbursed')}
                      </Option>
                      {/* {workflowLoading === false &&
                        workflowSteps.length &&
                        workflowSteps.map((step) => (
                          <Option key={`approval-step-${step.step_code}`} value={step.step_code}>
                            {t(step.step_name)}
                          </Option>
                        ))} */}
                      {/* {workflowLoading === true && (
                        <Option key={`approval-step`} value={''}>
                          Select Approval Step
                        </Option>
                      )} */}
                    </>
                  </Select>
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item name='branch_id' label={t('Request From DMP Unit')}>
                  <BranchSelect
                    branchId={formRef.getFieldValue('branch_id')}
                    placeholder={t('Select DMP Unit')}
                    onSelect={(value, option) => {
                      formRef.setFieldsValue({branch_id: value})
                    }}
                    onLoad={(value) => {
                      formRef.setFieldsValue({branch_id: value})
                    }}
                    onClear={() => {
                      formRef.setFieldsValue({branch_id: null, item_ids: []})
                    }}
                  />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item name='request_by' label={t('Signature By')}>
                  <UserSelect
                    userId={formRef.getFieldValue('request_by')}
                    placeholder={t('Select User')}
                    allowClear={true}
                    onSelect={(value, option) => {
                      formRef.setFieldsValue({request_by: value})
                    }}
                    onLoad={(value) => {
                      formRef.setFieldsValue({request_by: value})
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Form.Item name='logistic_id' label={t('Select Logistic')}>
                  <LogisticGridSelect
                    logisticId={formRef.getFieldValue('logistic_id')}
                    onClick={(value, option) => {
                      formRef.setFieldsValue({
                        logistic_id: value,
                      })
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>

          <Row gutter={[16, 16]}>
            <Col sm={24} md={24} lg={24}>
              <div className='d-flex justify-content-end'>
                <Button type='primary' onClick={() => onSubmit('preview')} className='me-3'>
                  <RefreshIcon />
                  {t('Preview')}
                </Button>
                <PrintOpenModal
                  btnType='primary'
                  width='2000'
                  btnText={t('Print Preview')}
                  modalBtnText={t('Print')}
                  modalTitle={t('Print Preview')}
                  filters={filters}
                  {...restProps}
                  component={ListingComponent}
                />

                <Button
                  className='ms-3 me-3'
                  key='submit'
                  type='default'
                  onClick={() => onSubmit('export')}
                  disabled={exportLoading ? true : false}
                >
                  <Spin spinning={exportLoading} style={{paddingRight: '5px'}}></Spin>
                  {t('Export as XLS')}
                </Button>

                <Button
                  className='me-3'
                  type='link'
                  onClick={(event) => handleCallbackFunc('singleAction', 'resetListing')}
                >
                  <ResetIcon />
                  {t('Reset')}
                </Button>
              </div>
            </Col>
          </Row>
        </Panel>
      </Collapse>
    </div>
  )
}
export default React.memo(RequisitionAnalyticListFilter)
