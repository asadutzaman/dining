import React, {FC} from 'react'
import {Input, Select, Form} from 'antd'
import {ExampleAction} from '../Actions/Example.actions'
import CreateAction from 'src/app/components/Actions/CreateAction'
import BulkAction from 'src/app/components/Actions/BulkAction'
import {Col, Row} from 'react-bootstrap'
import {RefreshIcon, ResetIcon} from 'src/app/../_metronic/assets/images/icon/svg'

const ExampleListFilter: FC<any> = (props) => {
  const {Search} = Input
  const {Option} = Select
  const {filters, handleOnChanged, handleCallbackFunc} = props

  return (
    <div className='p-6'>
      <Row gutter={[16, 16]}>
        <Col md={6} xs={12}>
          <div className='card card-header p-0 pb-3' style={{minHeight: '0px'}}>
            <h3 className='card-title align-items-start flex-column'>
              <span className='card-label fw-bold fs-3 mb-1'>Examples</span>
            </h3>
          </div>
        </Col>
        <Col md={6} xs={12}>
          <CreateAction
            actionItem={ExampleAction.COMMON_ACTION.CREATE}
            handleCallbackFunc={handleCallbackFunc}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col md={4} xs={12}>
          <Form.Item name='search'>
            <Search placeholder='Search' onSearch={(value) => handleOnChanged('search', value)} />
          </Form.Item>
        </Col>

        <Col md={4} xs={12}>
          <Form.Item name='status' label='Status'>
            <Select
              showSearch
              popupMatchSelectWidth={100}
              defaultValue={filters.status}
              optionFilterProp='children'
              onChange={(value) => handleOnChanged('filter_status', value)}
              filterOption={(input, option: any) =>
                option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              <Option value=''>All</Option>
              <Option value='1'>Active</Option>
              <Option value='0'>Inactive</Option>
            </Select>
          </Form.Item>
        </Col>

        <Col md={4} xs={12}>
          <div className='d-flex justify-content-end'>
            <button
              // disabled={isLoading}
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

            <BulkAction
              bulkAction={ExampleAction.BULK_ACTION}
              handleCallbackFunc={handleCallbackFunc}
            />
          </div>
        </Col>
      </Row>
    </div>
  )
}
export default React.memo(ExampleListFilter)
