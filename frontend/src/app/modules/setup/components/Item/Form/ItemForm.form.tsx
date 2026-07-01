import React, {FC, Fragment} from 'react'
import {Form, Input, Row, Col, Select, Divider, InputNumber} from 'antd'
import {rules} from 'src/app/components/Validation/Form.validate'
import UnitSelect from 'src/app/components/Dropdown/UnitSelect'
import ItemCategorySelect from 'src/app/components/Dropdown/ItemCategorySelect'
import LogisticSelect from 'src/app/components/Dropdown/LogisticSelect'
import BrandSelect from 'src/app/components/Dropdown/BrandSelect'
import AttributeListController from '../AddMore/Attribute/List/AttributeList.controller'
import UnitMappingListController from '../AddMore/UnitMapping/List/UnitMappingList.controller'
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

const ItemAddOrEditForm: FC<any> = (props) => {
  const {Option} = Select
  const {
    formRef,
    initialValues,
    itemData,
    loading,
    handleChange,
    handleSubmit,
    handleSubmitFailed,
    attributeListData,
    setAttributeListData,
    unitMappingListData,
    setUnitMappingListData,
  } = props
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
            <Col span={8}>
              <Form.Item label={t('Item type')} name='type' rules={rules.required}>
                <Select placeholder={t('Select Item Type')}>
                  <Option value='CONSUMABLE'>{t('Consumable')}</Option>
                  <Option value='NON_CONSUMABLE'>{t('Non-Consumable')}</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item label={t('Item Name (EN)')} name='name_en' rules={rules.required}>
                <Input placeholder={t('Item Name (EN)')} />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item label={t('Item Name (BN)')} name='name_bn' rules={rules.required}>
                <Input placeholder={t('Item Name (BN)')} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={8}>
              <Form.Item label={t('Logistic')} name='logistic_id' rules={rules.required}>
                <LogisticSelect
                  logisticId={formRef.getFieldValue('logistic_id')}
                  placeholder={t('Select Logistic')}
                  allowClear={true}
                  onSelect={(value, option) => {
                    formRef.setFieldsValue({logistic_id: value})
                  }}
                  onLoad={(value) => {
                    formRef.setFieldsValue({logistic_id: value})
                  }}
                />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item label={t('Item Category')} name='item_category_id' rules={rules.required}>
                <ItemCategorySelect
                  itemCategoryId={formRef.getFieldValue('item_category_id')}
                  placeholder={t('Select Item Category')}
                  onSelect={(value, option) => {
                    formRef.setFieldsValue({item_category_id: value})
                  }}
                  onLoad={(value) => {
                    formRef.setFieldsValue({item_category_id: value})
                  }}
                />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item label={t('Brand')} name='brand_id' rules={rules.required}>
                <BrandSelect
                  brandId={formRef.getFieldValue('brand_id')}
                  placeholder={t('Select Brand')}
                  onSelect={(value, option) => {
                    formRef.setFieldsValue({brand_id: value})
                  }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={8}>
              <Form.Item label={t('Base Unit')} name='base_unit_id' rules={rules.required}>
                <UnitSelect
                  unitId={formRef.getFieldValue('base_unit_id')}
                  placeholder={t('Select Base Unit')}
                  onSelect={(value, option) => {
                    formRef.setFieldsValue({base_unit_id: value})
                  }}
                />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item label={t('Reorder Qty')} name='reorder_qty' rules={rules.required}>
                <InputNumber placeholder={t('10')} min={0} style={{width: '100%'}} />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item label={t('Description')} name='description'>
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={24}>
              <Divider orientation='left' orientationMargin='0'>
                {t('Item Attributes')}
              </Divider>
              <AttributeListController
                loading={loading}
                itemData={itemData}
                moreItemListData={attributeListData}
                setMoreItemListData={setAttributeListData}
              />
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={24}>
              <Divider orientation='left' orientationMargin='0'>
                {t('Item Unit Mapping')}
              </Divider>
              <UnitMappingListController
                loading={loading}
                itemData={itemData}
                moreItemListData={unitMappingListData}
                setMoreItemListData={setUnitMappingListData}
              />
            </Col>
          </Row>
        </Form>
      </div>
    </Fragment>
  )
}
export default React.memo(ItemAddOrEditForm)
