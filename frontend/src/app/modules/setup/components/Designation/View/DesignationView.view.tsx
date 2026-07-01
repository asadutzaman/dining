import React, {FC} from 'react'
import DesignationViewTab from '../Tabs/DesignationView.tab'
import {Col, Row} from 'react-bootstrap'
import {Spin} from 'antd'
import {DesignationAction} from '../Actions/Designation.actions'
import RequisitionItemLimitListController from '../Tabs/RequisitionItemLimit/List/RequisitionItemLimitList.controller'
import BackLink from 'src/app/components/Link/BackLink'
import ViewTabList from 'src/app/components/Tab/ViewTabList'

const DesignationView: FC<any> = (props) => {
  const {modalTitle, itemData, loading} = props

  const viewTabListData: any = [
    {
      tabIndex: 1,
      label: 'Designation Info',
      permission: '',
      component: <DesignationViewTab itemData={itemData} />,
    },
    {
      tabIndex: 2,
      label: 'Requisition Item Limit',
      permission: '',
      component: <RequisitionItemLimitListController />,
    },
  ]

  return (
    <>
      <div className='card card-body position-relative p-6'>
        <Row gutter={24}>
          <Col span={12}>
            <div className='card card-header p-0 pb-3' style={{minHeight: '0px'}}>
              <h3 className='card-title align-items-start flex-column'>
                <span className='card-label fw-bold fs-3 mb-1'>
                  {modalTitle}: {itemData.title}{' '}
                  {loading && (
                    <>
                      <Spin size='small' spinning={loading} />
                      &nbsp;
                    </>
                  )}
                </span>
              </h3>
            </div>
          </Col>

          <Col span={12} style={{textAlign: 'right'}}>
            <BackLink
              actionItem={DesignationAction.COMMON_ACTION.LISTING}
              btnText={'Back to list'}
            />
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={24}>
            {loading === false && (
              <ViewTabList activeTabIndex={'1'} viewTabListData={viewTabListData} />
            )}
          </Col>
        </Row>
      </div>
    </>
  )
}
export default React.memo(DesignationView)
