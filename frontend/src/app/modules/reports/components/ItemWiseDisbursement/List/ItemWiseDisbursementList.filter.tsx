import React, { FC } from 'react';
import { Button, Form, Row, Col, Collapse, Spin, Select } from 'antd';
import PrintOpenModal from 'src/app/components/Print/PrintOpenModal';
import { rules } from 'src/app/components/Validation/Form.validate';
import { RefreshIcon, ResetIcon } from 'src/_metronic/assets/images/icon/svg';
import LiveSearchItemSelect from 'src/app/components/Dropdown/LiveSearch/LiveSearchItemSelect';
import { useLang } from 'src/app/hooks/useLang';

const ItemWiseDisbursementListFilter: FC<any> = (props) => {
  const { Option } = Select;
  const { Panel } = Collapse;
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
  } = props;
  const { t } = useLang();

  const onSubmit = (submitType: any) => {
    if (submitType === 'preview') {
      setIsExportSubmitted(false);
      setIsSubmitted(true);
    } else if (submitType === 'export') {
      setIsSubmitted(false);
      setIsExportSubmitted(true);
    }
    formRef.submit();
  };

  return (
    <div className="p-6">
      <Collapse defaultActiveKey={['1']}>
        <Panel header={t('Item Wise Disbursement Filter')} key="1">
          <Form
            layout="vertical"
            form={formRef}
            name="exampleForm"
            scrollToFirstError={true}
            initialValues={initialValues}
            onValuesChange={handleChange}
            onFinish={handleSubmit}
          >
            <Row gutter={[16, 16]}>
              <Col span={6}>
                <Form.Item
                  name="item_id"
                  label={t('Search Items')}
                  rules={rules.required}
                >
                  <LiveSearchItemSelect
                    itemCode={formRef.getFieldValue('item_id')}
                    placeholder={t('Search by Item Code/Name')}
                    isMultiple={false}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>

          <Row gutter={[16, 0]}>
            <Col sm={24} md={24} lg={24}>
              <div className="d-flex justify-content-end">
                <Button
                  type="primary"
                  onClick={() => onSubmit('preview')}
                  className="me-3"
                >
                  <RefreshIcon />
                  {t('Preview')}
                </Button>
                <PrintOpenModal
                  btnType="primary"
                  width="2000"
                  btnText={t('Print Preview')}
                  modalBtnText={t('Print')}
                  modalTitle={t('Print Preview')}
                  filters={filters}
                  {...restProps}
                  component={ListingComponent}
                />

                <Button
                  className="ms-3 me-3"
                  key="submit"
                  type="default"
                  onClick={() => onSubmit('export')}
                  disabled={exportLoading ? true : false}
                >
                  <Spin
                    spinning={exportLoading}
                    style={{ paddingRight: '5px' }}
                  ></Spin>
                  {t('Export as XLS')}
                </Button>

                <Button
                  className="me-3"
                  type="link"
                  onClick={(event) =>
                    handleCallbackFunc('singleAction', 'resetListing')
                  }
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
  );
};
export default React.memo(ItemWiseDisbursementListFilter);
