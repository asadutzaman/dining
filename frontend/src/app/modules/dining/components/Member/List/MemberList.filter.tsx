import React, {FC} from 'react'
import {Input, Select, Form} from 'antd'
import {Link} from 'react-router-dom'
import {MemberAction} from '../Actions/Member.actions'
import CreateAction from 'src/app/components/Actions/CreateAction'
import {Col, Row} from 'react-bootstrap'
import {RefreshIcon, ResetIcon} from 'src/app/../_metronic/assets/images/icon/svg'
import {usePermissionContext} from 'src/app/hooks/context/usePermissionContext'

const MemberListFilter: FC<any> = (props) => {
  const {Search} = Input
  const {Option} = Select
  const {filters, handleOnChanged, handleCallbackFunc, onOpenCandidatePicker} = props
  const {isPermissionLoaded, hasPermission} = usePermissionContext()

  return (
    <div className='p-6'>
      <Row gutter={[16, 16]}>
        <Col md={6} xs={12}>
          <div className='card card-header p-0 pb-3' style={{minHeight: '0px'}}>
            <h3 className='card-title align-items-start flex-column'>
              <span className='card-label fw-bold fs-3 mb-1'>Members</span>
            </h3>
          </div>
        </Col>
        <Col md={6} xs={12}>
          <div className='d-flex justify-content-end'>
            <Link to='/admin/dining/member/import' className='btn btn-light-primary me-3'>
              Bulk Import
            </Link>
            {isPermissionLoaded && hasPermission('auth:member:create') && (
              <button
                type='button'
                className='btn btn-light-primary me-3'
                onClick={() => onOpenCandidatePicker && onOpenCandidatePicker()}
              >
                Add From API
              </button>
            )}
            <CreateAction
              actionItem={MemberAction.COMMON_ACTION.CREATE}
              handleCallbackFunc={handleCallbackFunc}
            />
          </div>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col md={4} xs={12}>
          <Form.Item name='search'>
            <Search
              placeholder='Search by name, card no, roll no'
              onSearch={(value) => handleOnChanged('search', value)}
            />
          </Form.Item>
        </Col>

        <Col md={3} xs={12}>
          <Form.Item name='member_type' label='Member Type'>
            <Select
              showSearch
              popupMatchSelectWidth={130}
              defaultValue={filters.member_type}
              optionFilterProp='children'
              onChange={(value) => handleOnChanged('filter_member_type', value)}
              filterOption={(input, option: any) =>
                option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              <Option value=''>All</Option>
              <Option value='STAFF'>Staff</Option>
              <Option value='STUDENT'>Student</Option>
            </Select>
          </Form.Item>
        </Col>

        <Col md={3} xs={12}>
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

        <Col md={2} xs={12}>
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
export default React.memo(MemberListFilter)
