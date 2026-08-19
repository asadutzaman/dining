import React, {FC} from 'react'
import {Select, Form} from 'antd'
import {Link} from 'react-router-dom'
import {Col, Row} from 'react-bootstrap'
import {RefreshIcon, ResetIcon} from 'src/app/../_metronic/assets/images/icon/svg'

const MealTokenListFilter: FC<any> = (props) => {
  const {Option} = Select
  const {filters, handleOnChanged, handleCallbackFunc} = props

  return (
    <div className='p-6'>
      <Row gutter={[16, 16]}>
        <Col md={6} xs={12}>
          <div className='card card-header p-0 pb-3' style={{minHeight: '0px'}}>
            <h3 className='card-title align-items-start flex-column'>
              <span className='card-label fw-bold fs-3 mb-1'>Meal Tokens</span>
            </h3>
          </div>
        </Col>
        <Col md={6} xs={12}>
          <div className='d-flex justify-content-end'>
            <Link to='/admin/dining/meal-token/issue' className='btn btn-primary'>
              Issue Token
            </Link>
          </div>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col md={3} xs={12}>
          <Form.Item name='meal_type' label='Meal Type'>
            <Select
              showSearch
              popupMatchSelectWidth={130}
              defaultValue={filters.meal_type}
              optionFilterProp='children'
              onChange={(value) => handleOnChanged('filter_meal_type', value)}
              filterOption={(input, option: any) =>
                option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              <Option value=''>All</Option>
              <Option value='BREAKFAST'>Breakfast</Option>
              <Option value='LUNCH'>Lunch</Option>
              <Option value='DINNER'>Dinner</Option>
            </Select>
          </Form.Item>
        </Col>

        <Col md={3} xs={12}>
          <Form.Item name='payment_status' label='Payment'>
            <Select
              showSearch
              popupMatchSelectWidth={130}
              defaultValue={filters.payment_status}
              optionFilterProp='children'
              onChange={(value) => handleOnChanged('filter_payment_status', value)}
              filterOption={(input, option: any) =>
                option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              <Option value=''>All</Option>
              <Option value='PAID'>Paid</Option>
              <Option value='DUE'>Due</Option>
            </Select>
          </Form.Item>
        </Col>

        <Col md={3} xs={12}>
          <Form.Item name='collection_status' label='Collection'>
            <Select
              showSearch
              popupMatchSelectWidth={130}
              defaultValue={filters.collection_status}
              optionFilterProp='children'
              onChange={(value) => handleOnChanged('filter_collection_status', value)}
              filterOption={(input, option: any) =>
                option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              <Option value=''>All</Option>
              <Option value='ISSUED'>Issued</Option>
              <Option value='COLLECTED'>Collected</Option>
            </Select>
          </Form.Item>
        </Col>

        <Col md={3} xs={12}>
          <div className='d-flex justify-content-end'>
            <button
              title='Reset'
              type='button'
              className='btn btn-sm btn-light-primary me-3'
              onClick={(event) => handleCallbackFunc(null, 'resetListing')}
            >
              <ResetIcon />
            </button>

            <button
              title='Refresh'
              type='button'
              className='btn btn-sm btn-light-primary me-3'
              onClick={(event) => handleCallbackFunc(null, 'reloadListing')}
            >
              <RefreshIcon />
            </button>
          </div>
        </Col>
      </Row>
    </div>
  )
}
export default React.memo(MealTokenListFilter)
