import React, {FC} from 'react'
import {Button, Select, Form, Input, Row, Col, Collapse, Spin} from 'antd'
import PrintOpenModal from 'src/app/components/Print/PrintOpenModal'
import {rules} from 'src/app/components/Validation/Form.validate'
import {RefreshIcon, ResetIcon} from 'src/_metronic/assets/images/icon/svg'
import LiveSearchItemSelect from 'src/app/components/Dropdown/LiveSearch/LiveSearchItemSelect'
import BranchSelect from 'src/app/components/Dropdown/BranchSelect'
import {useLang} from 'src/app/hooks/useLang'
import {LogisticSelect} from 'src/app/components/Dropdown'
import LogisticGridSelect from 'src/app/components/Dropdown/LogisticGridSelect'

const ItemStockListFilter: FC<any> = (props) => {
  const {Panel} = Collapse
  const {Option} = Select
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

  const currentYear = new Date().getFullYear()
  const years = Array.from({length: 5}, (_, i) => currentYear - i)

  return (
    <div className='p-6'>
      <Collapse defaultActiveKey={['1']}>
        <Panel header={t('Item Stock Analytics')} key='1'>
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
              {/* <Col span={6}>
                <Form.Item name='branch_id' label={t('Thana')} rules={rules.required}>
                  <BranchSelect
                    branchId={formRef.getFieldValue('branch_id') || 1}
                    placeholder={t('Select Thana')}
                    onSelect={(value, option) => {
                      formRef.setFieldsValue({branch_id: value})
                    }}
                    onLoad={(value) => {
                      formRef.setFieldsValue({branch_id: value})
                    }}
                    onClear={() => {
                      formRef.setFieldsValue({branch_id: null, item_ids: []})
                    }}
                  />
                </Form.Item>
              </Col> */}

              <Col span={24}>
                <Form.Item name='logistic_id' label={t('Select Logistic')} rules={rules.required}>
                  <LogisticGridSelect
                    logisticId={formRef.getFieldValue('logistic_id')}
                    onClick={(value, option) => {
                      formRef.setFieldsValue({
                        logistic_id: value,
                      })
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Form.Item name='item_ids' label={t('Search Items')}>
                  <LiveSearchItemSelect
                    itemCode={formRef.getFieldValue('item_ids')}
                    placeholder={t('Search by Item Code/Name')}
                    isMultiple={true}
                  />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item name='stock_level' label={t('Stock Level')}>
                  <Select
                    value={formRef.getFieldValue('stock_level')}
                    placeholder={t('Select Stock Level')}
                    allowClear={true}
                  >
                    <Option value='SAFE'>{t('Safe')}</Option>
                    <Option value='HIGH_DEMAND'>{t('High Demand')}</Option>
                    <Option value='DEMAND_GT_STOCK'>{t('Demand > Stock')}</Option>
                    <Option value='ZERO_STOCK'>{t('Zero Stock')}</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item name='financial_year' label={t('Fiscal Year')}>
                  <Select
                    showSearch
                    defaultValue={formRef.getFieldValue('financial_year')}
                    optionFilterProp='children'
                    onChange={(value) => formRef.setFieldsValue({financial_year: value})}
                    filterOption={(input, option: any) =>
                      option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    placeholder={t('Select Fiscal Year')}
                  >
                    {years.map((year) => (
                      <Option key={year} value={`${year}-${year + 1}`}>
                        {t(`${year} - ${year + 1}`)}
                      </Option>
                    ))}
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
export default React.memo(ItemStockListFilter)
