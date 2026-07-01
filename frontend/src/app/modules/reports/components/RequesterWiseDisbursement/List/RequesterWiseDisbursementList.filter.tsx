import React, {FC} from 'react'
import {Button, Form, Row, Col, Collapse, Spin, Select} from 'antd'
import PrintOpenModal from 'src/app/components/Print/PrintOpenModal'
import {rules} from 'src/app/components/Validation/Form.validate'
import {RefreshIcon, ResetIcon} from 'src/_metronic/assets/images/icon/svg'
import UserSelect from 'src/app/components/Dropdown/UserSelect'
import {useLang} from 'src/app/hooks/useLang'

const RequesterWiseDisbursementListFilter: FC<any> = (props) => {
  const {Option} = Select
  const {Panel} = Collapse
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
        <Panel header={t('Requester Wise Disbursement Filter')} key='1'>
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
                <Form.Item name='user_id' label={t('Requester')} rules={rules.required}>
                  <UserSelect
                    userId={formRef.getFieldValue('user_id')}
                    placeholder={t('Select Requester')}
                    disabled={false}
                    onSelect={(value, option) => {
                      formRef.setFieldsValue({
                        user_id: value,
                      })
                    }}
                    onLoad={(value) => {
                      formRef.setFieldsValue({user_id: value})
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>

          <Row gutter={[16, 0]}>
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
export default React.memo(RequesterWiseDisbursementListFilter)
