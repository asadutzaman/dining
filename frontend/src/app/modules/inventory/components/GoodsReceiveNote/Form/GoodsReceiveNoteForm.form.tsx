import React, { FC, Fragment, useContext, useState } from 'react';
import { Form, Input, Row, Col, Select, DatePicker, Divider, Spin } from 'antd';
import { rules } from 'src/app/components/Validation/Form.validate';
import GoodsReceiveNoteItemAddMore from '../AddMore/GoodsReceiveNoteItem.addMore';
import ItemSelect from 'src/app/components/Dropdown/LiveSearch/ItemSelect';
import { useLang } from 'src/app/hooks/useLang';
import { AuthContext } from 'src/app/context/auth/auth.context';
import { LogisticSelect } from 'src/app/components/Dropdown';
import SupplierSelect from 'src/app/components/Dropdown/SupplierSelect';

const formItemLayout = {
  labelCol: {
    xs: { span: 12 },
    sm: { span: 12 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 24 },
  },
};

const GoodsReceiveNoteAddOrEditForm: FC<any> = (props) => {
  const { Option } = Select;
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
  } = props;
  const [isLoadingItemAddingItem, setIsLoadingItemAddingItem] =
    useState<boolean>(false);
  const { t } = useLang();
  const { branchId, logisticId } = useContext(AuthContext);

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
            <Col span={12}>
              <Form.Item
                label={t('Reference Challan Number')}
                name="ref_challan_no"
                rules={rules.required}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t('Reference Challan Date')}
                name="ref_challan_date"
                rules={rules.required}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  placeholder={t('Select Date')}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label={t('Reference Purchase Order')}
                name="ref_po_number"
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t('Reference Purchase Date')}
                name="ref_po_date"
              >
                <DatePicker
                  style={{ width: '100%' }}
                  placeholder={t('Select Date')}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label={t('Supplier')}
                name="supplier_id"
                rules={rules.required}
              >
                <SupplierSelect
                  supplierId={formRef.getFieldValue('supplier_id')}
                  placeholder={t('Select Supplier')}
                  onSelect={(value, option) => {
                    formRef.setFieldsValue({ supplier_id: value });
                  }}
                  onLoad={(value) => {
                    formRef.setFieldsValue({ supplier_id: value });
                  }}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label={t('Remarks')} name="remarks">
                <Input.TextArea />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label={t('Logistic')}
                name="logistic_id"
                rules={rules.required}
              >
                <LogisticSelect
                  logisticId={formRef.getFieldValue('logistic_id')}
                  placeholder={t('Select Logistic')}
                  allowClear={true}
                  onSelect={handleLogisticChange}
                  onLoad={(value) => {
                    formRef.setFieldsValue({ logistic_id: value });
                  }}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label={t('Inventory Item')}
                labelCol={{ span: 24 }}
                name={'item_id'}
              >
                <ItemSelect
                  itemNameCode={formRef.getFieldValue('item_id')}
                  logisticId={formRef.getFieldValue('logistic_id')}
                  placeholder={t('Search by Item Name/Code (type min 3 digit)')}
                  onLoad={(value) => {
                    formRef.setFieldsValue({ item_id: value });
                  }}
                  onSelect={(value, option) =>
                    handleItemSelect(
                      value,
                      option,
                      formRef.getFieldValue('logistic_id')
                    )
                  }
                  onChange={(value, option) => {
                    formRef.setFieldsValue({ item_id: value });
                  }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" orientationMargin="0">
            {t('Particulars of Goods Receive Note')}
          </Divider>
          {isLoadingGrnItem && (
            <>
              <Spin size="small" spinning={isLoadingGrnItem} />
              &nbsp;
            </>
          )}
          {isLoadingGrnItem === false && (
            <Row gutter={[16, 16]}>
              <Col sm={24} xs={24}>
                <GoodsReceiveNoteItemAddMore
                  addMoreItemList={grnItemList}
                  setAddMoreItemList={setGrnItemList}
                />
              </Col>
            </Row>
          )}

          <Row gutter={24}>
            <Col span={24}>
              <Form.Item
                label={t('Process Status')}
                name="process_status"
                rules={rules.required}
              >
                <Select placeholder={t('Select process status')}>
                  <Option value="DRAFT">{t('Draft')}</Option>
                  <Option value="SUBMITTED">{t('Submit')}</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
    </Fragment>
  );
};
export default React.memo(GoodsReceiveNoteAddOrEditForm);
