import React, {FC, Fragment} from 'react'
import {Form, Input, Row, Col, Select, Divider, Spin} from 'antd'
import ItemConsumptionItemAddMore from '../AddMore/ItemConsumptionItem.addMore'
import {useLang} from 'src/app/hooks/useLang'

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

const ItemConsumptionAddOrEditForm: FC<any> = (props) => {
  const {
    formRef,
    initialValues,
    handleChange,
    handleSubmit,
    handleSubmitFailed,
    isLoadingItemConsumptionItem,
    itemConsumptionItemList,
    setItemConsumptionItemList,
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
            <Col span={24}>
              <Divider orientation='left' orientationMargin='0'>
                {t("Particulars of Item Consumption's Item")}
              </Divider>
              {isLoadingItemConsumptionItem && (
                <>
                  <Spin size='small' spinning={isLoadingItemConsumptionItem} />
                  &nbsp;
                </>
              )}
              {isLoadingItemConsumptionItem === false && (
                <Row gutter={[16, 16]}>
                  <Col sm={24} xs={24}>
                    <ItemConsumptionItemAddMore
                      addMoreItemList={itemConsumptionItemList}
                      setAddMoreItemList={setItemConsumptionItemList}
                    />
                  </Col>
                </Row>
              )}
            </Col>
          </Row>
        </Form>
      </div>
    </Fragment>
  )
}
export default React.memo(ItemConsumptionAddOrEditForm)
