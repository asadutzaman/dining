import React, {FC, Fragment} from 'react'
import {Form, Input, Row, Col, Divider, Spin} from 'antd'
import {rules} from 'src/app/components/Validation/Form.validate'
import RequisitionApprovalItemAddMore from '../../AddMore/RequisitionApprovalItem.addMore'
import {useLang} from 'src/app/hooks/useLang'

const formItemLayout = {
  labelCol: {
    xs: {span: 24},
    sm: {span: 24},
  },
  wrapperCol: {
    xs: {span: 24},
    sm: {span: 24},
  },
}

const ReviseRequisitionActionForm: FC<any> = (props) => {
  const {TextArea} = Input
  const {
    formRef,
    loading,
    confirmText,
    initialValues,
    workflowActionInfo,
    itemList,
    setItemList,
    handleChange,
    handleSubmit,
    handleSubmitFailed,
  } = props
  const {t} = useLang()

  return (
    <Fragment>
      <div className='border border-gray rounded mt-3 p-5'>
        <Form
          {...formItemLayout}
          layout='vertical'
          form={formRef}
          name='workflowTransitionForm'
          scrollToFirstError={true}
          initialValues={initialValues}
          onValuesChange={handleChange}
          onFinish={handleSubmit}
          onFinishFailed={handleSubmitFailed}
        >
          <Row gutter={24}>
            <Col span={24}>
              <div className='form-item-row'>
                <h3>{confirmText}</h3>
                <span className='text-danger'>
                  {t('NOTE: You can revise the item quantity only once.')}
                </span>
              </div>

              <Form.Item
                label={t('Write Revise Comment:')}
                name='comment'
                rules={workflowActionInfo.is_comment_mandatory ? rules.required : rules.notRequired}
              >
                <TextArea autoSize={{minRows: 3, maxRows: 5}} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={24}>
              <Divider orientation='left' orientationMargin='0'>
                {t('Requisition Items')}
              </Divider>
              {loading && (
                <>
                  <Spin size='small' spinning={loading} />
                  &nbsp;
                </>
              )}
              {loading === false && (
                <Row gutter={[16, 16]}>
                  <Col sm={24} xs={24}>
                    <RequisitionApprovalItemAddMore
                      addMoreItemList={itemList}
                      setAddMoreItemList={setItemList}
                    />
                  </Col>
                </Row>
              )}
            </Col>
          </Row>
        </Form>
      </div>
    </Fragment>
  )
}
export default React.memo(ReviseRequisitionActionForm)
