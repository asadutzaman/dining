import React, {FC, Fragment, useState} from 'react'
import {Form, Input, Row, Col, Select, Spin, Divider} from 'antd'
import {rules} from 'src/app/components/Validation/Form.validate'
import RequisitionItemAddMore from '../AddMore/RequisitionItem.addMore'
import ItemSelect from 'src/app/components/Dropdown/LiveSearch/ItemSelect'
import {ItemApi} from 'src/app/api'
import {useLang} from 'src/app/hooks/useLang'
import {LogisticSelect} from 'src/app/components/Dropdown'

const formItemLayout = {
  labelCol: {
    xs: {span: 6},
    sm: {span: 6},
  },
  wrapperCol: {
    xs: {span: 24},
    sm: {span: 24},
  },
}

const RequisitionAddOrEditForm: FC<any> = (props) => {
  const {Option} = Select
  const {TextArea} = Input
  const {
    formRef,
    initialValues,
    handleChange,
    handleSubmit,
    handleSubmitFailed,
    isLoadingRequisitionItem,
    handleItemSelect,
    requisitionItemList,
    setRequisitionItemList,
    handleLogisticChange,
  } = props
  const [isLoadingItemAddingItem, setIsLoadingItemAddingItem] = useState<boolean>(false)
  const {t} = useLang()

  return (
    <Fragment>
      <div className='form-page-content form-page-content-example pe-3'>
        <Form
          {...formItemLayout}
          layout='vertical'
          form={formRef}
          name='exampleForm'
          scrollToFirstError={true}
          initialValues={initialValues}
          onValuesChange={handleChange}
          onFinish={handleSubmit}
          onFinishFailed={handleSubmitFailed}
        >
          <Row gutter={24}>
            <Col span={24}>
              <Form.Item label={t('Requisition Subject')} name='subject' rules={rules.required}>
                <Input />
              </Form.Item>
            </Col>
            
            <Col span={24}>
              <Form.Item label={t('Description')} name='description'>
                <Input.TextArea />
              </Form.Item>
            </Col>
            {/* <Col span={24}>
              <Form.Item label={t('Logistic')} name='logistic_id' rules={rules.required}>
                <LogisticSelect
                  logisticId={formRef.getFieldValue('logistic_id')}
                  placeholder={t('Select Logistic')}
                  allowClear={false}
                  onSelect={handleLogisticChange}
                  onLoad={(value) => {
                    formRef.setFieldsValue({logistic_id: value})
                  }}
                />
              </Form.Item>
            </Col> */}
          </Row>
          <>
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item label={t('Inventory Item')} labelCol={{span: 24}} name={'item_id'}>
                  <ItemSelect
                    itemNameCode={formRef.getFieldValue('item_id')}
                    logisticId={formRef.getFieldValue('logistic_id')}
                    placeholder={t('Search by Item Name/Code (type min 3 digit)')}
                    onLoad={(value) => {
                      formRef.setFieldsValue({item_id: value})
                    }}
                    onSelect={(value, option) =>
                      handleItemSelect(value, option, formRef.getFieldValue('logistic_id'))
                    }
                    onChange={(value, option) => {
                      formRef.setFieldsValue({item_id: value})
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation='left' orientationMargin='0'>
              {t('Particulars of Requisition Item')}
            </Divider>
            {isLoadingRequisitionItem && (
              <>
                <Spin size='small' spinning={isLoadingRequisitionItem} />
                &nbsp;
              </>
            )}
            {isLoadingRequisitionItem === false && (
              <Row gutter={[16, 16]}>
                <Col sm={24} xs={24}>
                  <RequisitionItemAddMore
                    addMoreItemList={requisitionItemList}
                    setAddMoreItemList={setRequisitionItemList}
                  />
                </Col>
              </Row>
            )}

            <Row gutter={24}>
              <Col span={24}>
                <Form.Item label={t('Process Status')} name='process_status' rules={rules.required}>
                  <Select placeholder={t('Select Process Status')}>
                    <Option value='DRAFT'>{t('Draft')}</Option>
                    <Option value='PENDING'>{t('Submit')}</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </>
        </Form>
      </div>
    </Fragment>
  )
}
export default React.memo(RequisitionAddOrEditForm)
