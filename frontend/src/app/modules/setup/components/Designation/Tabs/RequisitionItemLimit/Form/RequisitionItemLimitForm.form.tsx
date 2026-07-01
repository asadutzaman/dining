import React, {FC, Fragment, useContext, useState} from 'react'
import {Form, InputNumber, Row, Col, Select, DatePicker, Divider, Spin, Input} from 'antd'
import {rules} from 'src/app/components/Validation/Form.validate'
import RequisitionItemLimitItemAddMore from '../AddMore/RequisitionItemLimitItem.addMore'
import LiveSearchItemSelect from 'src/app/components/Dropdown/LiveSearch/LiveSearchItemSelect'
import {useLang} from 'src/app/hooks/useLang'
import {DesignationSelect} from 'src/app/components/Dropdown'
import { DATE_FORMAT_DATABASE } from 'src/app/constants/common.constant'

const formItemLayout = {
  labelCol: {
    xs: {span: 12},
    sm: {span: 12},
  },
  wrapperCol: {
    xs: {span: 24},
    sm: {span: 24},
  },
}

const RequisitionItemLimitAddOrEditForm: FC<any> = (props) => {
  const {Option} = Select
  const {
    formRef,
    initialValues,
    handleChange,
    handleSubmit,
    handleSubmitFailed,
    grnItemList,
    setGrnItemList,
    handleItemSelect,
    isLoadingGrnItem,
    handleLogisticChange,
    designationId,
    isNewRecord,
  } = props
  const [isLoadingItemAddingItem, setIsLoadingItemAddingItem] = useState<boolean>(false)
  const {t} = useLang()
  const limitTypeOptions = [{value: 'MONTHLY', label: t('Monthly')}, {value: 'YEARLY', label: t('Yearly')}]

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
            {!designationId && (
            <Col span={12}>
              <Form.Item label={t('Designation')} name='designation_id' rules={rules.required}>
                <DesignationSelect
                  designationId={formRef.getFieldValue('designation_id')}
                  placeholder={t('Select Designation')}
                  allowClear={true}
                  onLoad={(value) => formRef.setFieldsValue({designation_id: value})}
                />
              </Form.Item>
            </Col>
            )}
            <Col span={12}>
              <Form.Item label={t('Effective From')} name='effective_from' rules={rules.required}>
                <DatePicker style={{width: '100%'}} format={DATE_FORMAT_DATABASE} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={24}>
              {isNewRecord ? (
                <Form.Item label={t('Items')} name='item_ids' rules={rules.required}>
                  <LiveSearchItemSelect
                    itemCode={formRef.getFieldValue('item_ids')}
                    isMultiple={true}
                    placeholder={t('Search items (min 2 chars)')}
                    onChange={(values: any, options: any[]) => {
                      const selected = Array.isArray(values) ? values : [];
                      const nextList: any[] = [];
                      const seen: Record<number, boolean> = {};
                      options?.forEach((opt: any) => {
                        const id = Number(opt.value);
                        if (!seen[id]) {
                          seen[id] = true;
                          const existing = (grnItemList || []).find((x: any) => x.item_id === id);
                          nextList.push(
                            existing || {
                              item_id: id,
                              name: opt.label,
                              max_qty: 0,
                              limit_type: 'MONTHLY',
                            }
                          );
                        }
                      });
                      setGrnItemList(nextList);
                      formRef.setFieldsValue({item_ids: selected});
                    }}
                  />
                </Form.Item>
              ) : (
                <>
                  <Form.Item label={t('Item')}>
                    <Input disabled value={grnItemList?.[0]?.name || ''} />
                  </Form.Item>
                  <Form.Item name='item_ids' hidden>
                    <Input />
                  </Form.Item>
                </>
              )}
            </Col>
          </Row>

          <Divider orientation='left' orientationMargin='0'>
            {t('Item Limits')}
          </Divider>
          {isLoadingGrnItem && (
            <>
              <Spin size='small' spinning={isLoadingGrnItem} />
              &nbsp;
            </>
          )}
          {isLoadingGrnItem === false && (
            <Row gutter={[16, 16]}>
              <Col sm={24} xs={24}>
                <RequisitionItemLimitItemAddMore
                  addMoreItemList={grnItemList}
                  setAddMoreItemList={setGrnItemList}
                />
              </Col>
            </Row>
          )}

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label={t('Default Limit Type')}>
                <Select
                  placeholder={t('Select')}
                  onChange={(value) => {
                    const updated = (grnItemList || []).map((x: any) => ({...x, limit_type: value}))
                    setGrnItemList(updated)
                  }}
                >
                  {limitTypeOptions.map((opt) => (
                    <Option key={opt.value} value={opt.value}>
                      {opt.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={t('Default Max Qty')}>
                <InputNumber
                  min={0}
                  style={{width: '100%'}}
                  onChange={(value) => {
                    const updated = (grnItemList || []).map((x: any) => ({...x, max_qty: value || 0}))
                    setGrnItemList(updated)
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
    </Fragment>
  )
}
export default React.memo(RequisitionItemLimitAddOrEditForm)
