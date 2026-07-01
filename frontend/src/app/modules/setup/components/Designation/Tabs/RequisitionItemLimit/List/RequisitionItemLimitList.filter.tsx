import React, {FC} from 'react'
import {Input, Select, Form} from 'antd'
import {RequisitionItemLimitAction} from '../Actions/RequisitionItemLimit.actions'
import {Col, Row} from 'react-bootstrap'
import {DesignationSelect} from 'src/app/components/Dropdown'
import CreateAction from 'src/app/components/Actions/CreateAction'
import BulkAction from 'src/app/components/Actions/BulkAction'
import {RefreshIcon, ResetIcon} from 'src/app/../_metronic/assets/images/icon/svg'
import {useLang} from 'src/app/hooks/useLang'

const RequisitionItemLimitListFilter: FC<any> = (props) => {
  const {Search} = Input
  const {Option} = Select
  const {filters, handleOnChanged, handleCallbackFunc} = props
  const {t} = useLang()

  return (
    <div className='p-6'>
      <Row gutter={[16, 16]}>
        <Col md={6} xs={12}>
          <div className='card card-header p-0 pb-3' style={{minHeight: '0px'}}>
            <h3 className='card-title align-items-start flex-column'>
              <span className='card-label fw-bold fs-3 mb-1'>{t('Requisition Item Limits')}</span>
            </h3>
          </div>
        </Col>
        <Col md={6} xs={12}>
          <CreateAction
            actionItem={RequisitionItemLimitAction.COMMON_ACTION.CREATE}
            handleCallbackFunc={handleCallbackFunc}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col md={3} xs={12}>
          <Form.Item name='search'>
            <Search
              placeholder={t('Search')}
              onSearch={(value) => handleOnChanged('search', value)}
            />
          </Form.Item>
        </Col>

        <Col md={3} xs={12}>
          <Form.Item name='limit_type'>
            <Select
              placeholder={t('Limit Type')}
              allowClear
              onChange={(value) => handleOnChanged('limit_type', value)}
            >
              <Option value='MONTHLY'>{t('Monthly')}</Option>
              <Option value='YEARLY'>{t('Yearly')}</Option>
            </Select>
          </Form.Item>
        </Col>

        <Col md={6} xs={12}>
          <div className='d-flex justify-content-end'>
            <button
              // disabled={isLoading}
              title={t('Reset')}
              type='button'
              className='btn btn-sm btn-light-primary me-3'
              onClick={(event) => handleCallbackFunc(null, 'resetListing')}
            >
              <ResetIcon />
            </button>

            <button
              title={t('Refresh')}
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
export default React.memo(RequisitionItemLimitListFilter)
