import React, {FC} from 'react'
import {Input, Form} from 'antd'
import {Link} from 'react-router-dom'
import {Col, Row} from 'react-bootstrap'
import {RefreshIcon, ResetIcon} from 'src/app/../_metronic/assets/images/icon/svg'

const PaymentListFilter: FC<any> = (props) => {
  const {Search} = Input
  const {handleOnChanged, handleCallbackFunc} = props

  return (
    <div className='p-6'>
      <Row gutter={[16, 16]}>
        <Col md={6} xs={12}>
          <div className='card card-header p-0 pb-3' style={{minHeight: '0px'}}>
            <h3 className='card-title align-items-start flex-column'>
              <span className='card-label fw-bold fs-3 mb-1'>Payments</span>
            </h3>
          </div>
        </Col>
        <Col md={6} xs={12}>
          <div className='d-flex justify-content-end'>
            <Link to='/admin/dining/payment/collect' className='btn btn-primary'>
              Collect Due Bill
            </Link>
          </div>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col md={4} xs={12}>
          <Form.Item name='search'>
            <Search
              placeholder='Search by payment number'
              onSearch={(value) => handleOnChanged('search', value)}
            />
          </Form.Item>
        </Col>

        <Col md={8} xs={12}>
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
export default React.memo(PaymentListFilter)
