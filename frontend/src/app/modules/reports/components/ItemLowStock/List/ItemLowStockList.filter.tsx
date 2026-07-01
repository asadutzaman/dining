import React, {FC} from 'react'
import {Button, Form, Row, Col, Collapse, Spin, Select} from 'antd'
import PrintOpenModal from 'src/app/components/Print/PrintOpenModal'
import {rules} from 'src/app/components/Validation/Form.validate'
import {RefreshIcon, ResetIcon} from 'src/_metronic/assets/images/icon/svg'
import LiveSearchItemSelect from 'src/app/components/Dropdown/LiveSearch/LiveSearchItemSelect'
import {BranchSelect, LogisticSelect} from 'src/app/components/Dropdown'
import {useLang} from 'src/app/hooks/useLang'

const ItemLowStockListFilter: FC<any> = (props) => {
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
        <Panel header={t('Demand vs Stock Filter')} key='1'>
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
                <Form.Item name='branch_id' label={t('Thana (Warehouse)')} rules={rules.required}>
                  <BranchSelect
                    branchId={formRef.getFieldValue('branch_id') || 1}
                    placeholder={t('Select Thana (Warehouse)')}
                    disabled={false}
                    branchType='Warehouse'
                    onSelect={(value, option) => {
                      formRef.setFieldsValue({
                        branch_id: value,
                      })
                    }}
                    onLoad={(value) => {
                      formRef.setFieldsValue({branch_id: value})
                    }}
                  />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item name='logistic_id' label={t('Logistic')}>
                  <LogisticSelect
                    logisticId={formRef.getFieldValue('logistic_id')}
                    placeholder={t('Select Logistic')}
                    disabled={false}
                    onSelect={(value, option) => {
                      formRef.setFieldsValue({
                        logistic_id: value,
                      })
                    }}
                    onLoad={(value) => {
                      formRef.setFieldsValue({branch_id: value})
                    }}
                  />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item name='item_ids' label={t('Items')}>
                  <LiveSearchItemSelect
                    itemCode={formRef.getFieldValue('item_ids')}
                    placeholder={t('Search by Item Code/Name')}
                    isMultiple={true}
                  />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item name='stock_status' label={t('Stock')}>
                  <Select allowClear={true} placeholder={t('Select Risk Status')}>
                    <Option key={`risk-demand_gt_stock`} value={'DEMAND_GT_STOCK'}>
                      {t('Demand > Stock')}
                    </Option>
                    <Option key={`risk-low_stock`} value={'LOW_STOCK'}>
                      {t('Low Stock')}
                    </Option>
                    <Option key={`risk-empty_stock`} value={'EMPTY_STOCK'}>
                      {t('Empty Stock')}
                    </Option>
                  </Select>
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
export default React.memo(ItemLowStockListFilter)
