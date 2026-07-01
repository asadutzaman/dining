import React, { FC, Fragment, useState } from 'react';
import { Form, Input, Row, Col, Select, Spin, Divider } from 'antd';
import { rules } from 'src/app/components/Validation/Form.validate';
import StockAdjustmentItemAddMore from '../AddMore/StockAdjustmentItem.addMore';
import ItemSelect from 'src/app/components/Dropdown/LiveSearch/ItemSelect';
import { ItemApi } from 'src/app/api';
import { useLang } from 'src/app/hooks/useLang';

const formItemLayout = {
  labelCol: {
    xs: { span: 6 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 24 },
  },
};

const StockAdjustmentAddOrEditForm: FC<any> = (props) => {
  const { Option } = Select;
  const { TextArea } = Input;
  const {
    formRef,
    initialValues,
    handleChange,
    handleSubmit,
    handleSubmitFailed,
    isLoadingStockAdjustmentItem,
    handleItemSelect,
    stockAdjustmentItemList,
    setStockAdjustmentItemList,
  } = props;
  const [isLoadingItemAddingItem, setIsLoadingItemAddingItem] =
    useState<boolean>(false);
  const { t } = useLang();

  return (
    <Fragment>
      <div className="form-page-content form-page-content-example pe-3">
        <Form
          {...formItemLayout}
          layout="vertical"
          form={formRef}
          name="exampleForm"
          scrollToFirstError={true}
          initialValues={initialValues}
          onValuesChange={handleChange}
          onFinish={handleSubmit}
          onFinishFailed={handleSubmitFailed}
        >
          <Row gutter={24}>
            <Col span={24}>
              <Form.Item
                label={t('Adjustment Type')}
                name="adjustment_type"
                rules={rules.required}
              >
                <Select placeholder={t('Select Adjustment Type')}>
                  <Option value="INCREASE">{t('INCREASE')}</Option>
                  <Option value="DECREASE">{t('DECREASE')}</Option>
                </Select>
              </Form.Item>

              <Form.Item label={t('Reason')} name="reason" rules={rules.required}>
                <Input.TextArea />
              </Form.Item>
            </Col>
          </Row>
          <>
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  label={t('Inventory Item')}
                  labelCol={{ span: 24 }}
                  // name={'item_id'}
                >
                  <ItemSelect
                    itemNameCode={formRef.getFieldValue('item_id')}
                    placeholder={t(
                      'Search by Item Name/Code (type min 3 digit)'
                    )}
                    onLoad={(value) => {
                      formRef.setFieldsValue({ item_id: value });
                    }}
                    onSelect={handleItemSelect}
                    onChange={(value, option) => {
                      formRef.setFieldsValue({ item_id: value });
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left" orientationMargin="0">
              {t('Particulars of Stock Adjustment')}
            </Divider>
            {isLoadingStockAdjustmentItem && (
              <>
                <Spin size="small" spinning={isLoadingStockAdjustmentItem} />
                &nbsp;
              </>
            )}
            {isLoadingStockAdjustmentItem === false && (
              <Row gutter={[16, 16]}>
                <Col sm={24} xs={24}>
                  <StockAdjustmentItemAddMore
                    addMoreItemList={stockAdjustmentItemList}
                    setAddMoreItemList={setStockAdjustmentItemList}
                  />
                </Col>
              </Row>
            )}
          </>
        </Form>
      </div>
    </Fragment>
  );
};
export default React.memo(StockAdjustmentAddOrEditForm);
