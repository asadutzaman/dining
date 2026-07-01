import React, {FC, Fragment, useState} from 'react'
import {Form, Input, Row, Col, Select, Spin, Divider} from 'antd'
import {rules} from 'src/app/components/Validation/Form.validate'
import StockTransferItemAddMore from '../AddMore/StockTransferItem.addMore'
import ItemSelect from 'src/app/components/Dropdown/LiveSearch/ItemSelect'
import {ItemApi} from 'src/app/api'
import {useLang} from 'src/app/hooks/useLang'
import {BranchSelect} from 'src/app/components/Dropdown'

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

const StockTransferAddOrEditForm: FC<any> = (props) => {
  const {Option} = Select
  const {TextArea} = Input
  const {
    formRef,
    initialValues,
    handleChange,
    handleSubmit,
    handleSubmitFailed,
    isLoadingStockTransferItem,
    handleItemSelect,
    stockTransferItemList,
    setStockTransferItemList,
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
            <Col span={12}>
              <Form.Item label={t('Transfer From')} name='transfer_from' rules={rules.required}>
                <BranchSelect
                  branchId={formRef.getFieldValue('transfer_from')}
                  placeholder={t('Select branch')}
                  // disabled={true}
                  branchType='Warehouse'
                  onSelect={(value, option) => {
                    formRef.setFieldsValue({transfer_from: value})
                  }}
                  onLoad={(value) => {
                    formRef.setFieldsValue({transfer_from: value})
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={t('Transfer To')} name='transfer_to' rules={rules.required}>
                <BranchSelect
                  // branchId={formRef.getFieldValue('transfer_to')}
                  placeholder={t('Select branch')}
                  branchType='Branch'
                  isMultiple={true}
                  // onSelect={(value, option) => {
                  //   formRef.setFieldsValue({transfer_to: value})
                  // }}
                  // onLoad={(value) => {
                  //   formRef.setFieldsValue({transfer_to: value})
                  // }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={24}>
              <Form.Item label={t('Reason')} name='reason'>
                <Input.TextArea />
              </Form.Item>
            </Col>
          </Row>
          <>
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item label={t('Inventory Item')} labelCol={{span: 24}} name={'item_id'}>
                  <ItemSelect
                    itemNameCode={formRef.getFieldValue('item_id')}
                    placeholder={t('Search by Item Name/Code (type min 3 digit)')}
                    onLoad={(value) => {
                      formRef.setFieldsValue({item_id: value})
                    }}
                    onSelect={handleItemSelect}
                    onChange={(value, option) => {
                      formRef.setFieldsValue({item_id: value})
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation='left' orientationMargin='0'>
              {t('Particulars of Stock Transfer Item')}
            </Divider>
            {isLoadingStockTransferItem && (
              <>
                <Spin size='small' spinning={isLoadingStockTransferItem} />
                &nbsp;
              </>
            )}
            {isLoadingStockTransferItem === false && (
              <Row gutter={[16, 16]}>
                <Col sm={24} xs={24}>
                  <StockTransferItemAddMore
                    addMoreItemList={stockTransferItemList}
                    setAddMoreItemList={setStockTransferItemList}
                  />
                </Col>
              </Row>
            )}

            <Row gutter={24}>
              <Col span={24}>
                <Form.Item label={t('Process Status')} name='process_status' rules={rules.required}>
                  <Select placeholder={t('Select Process Status')}>
                    <Option value='DRAFT'>{t('Draft')}</Option>
                    <Option value='SUBMITTED'>{t('Submit')}</Option>
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
export default React.memo(StockTransferAddOrEditForm)
