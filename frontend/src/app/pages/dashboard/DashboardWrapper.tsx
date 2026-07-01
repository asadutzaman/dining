/* eslint-disable jsx-a11y/anchor-is-valid */
import {FC, useEffect, useState} from 'react'
// import { useIntl } from 'react-intl'
import {PageTitle} from '../../../_metronic/layout/core'
import {EngageWidget10, StatisticsWidget5} from '../../../_metronic/partials/widgets'
import {KTIcon, toAbsoluteUrl} from 'src/_metronic/helpers'
import {Button, Select, Form, Input, Row, Col, Collapse, Spin} from 'antd'
import {RefreshIcon, ResetIcon} from 'src/_metronic/assets/images/icon/svg'

import {ChartsWidget1} from 'src/_metronic/partials/widgets/_new/engage/ChartWidget1'
import {PolarAreaWidget1} from 'src/_metronic/partials/widgets/_new/engage/PolarAreaWidget1'
import {PolarAreaWidget2} from 'src/_metronic/partials/widgets/_new/engage/PolarAreaWidget2'
import {PolarAreaWidget3} from 'src/_metronic/partials/widgets/_new/engage/PolarAreaWidget3'
import {RadialBarChartWidget1} from 'src/_metronic/partials/widgets/_new/engage/RadialBarChartWidget1'
import {CardsWidget1} from 'src/_metronic/partials/widgets/_new/engage/CardsWidget1'
import {CardsWidget2} from 'src/_metronic/partials/widgets/_new/engage/CardsWidget2'
import {CardsWidget3} from 'src/_metronic/partials/widgets/_new/engage/CardsWidget3'
import {OauthApi} from 'src/app/api'
import {useErrorHandler} from 'src/app/hooks/useErrorHandler'

import {usePermissionContext} from 'src/app/hooks/context/usePermissionContext'
import RequisitionFunnel from 'src/_metronic/partials/widgets/statistics/RequisitionFunnel'
import OfficerLeaderboard from 'src/_metronic/partials/widgets/statistics/OfficerLeaderboard'
import ThanaRequisitionOverview from 'src/_metronic/partials/widgets/statistics/ThanaRequisitionOverview'
import DemandVsStockWidget from 'src/_metronic/partials/widgets/statistics/DemandVsStockWidget'
import {useLang} from 'src/app/hooks/useLang'

const DashboardPage: FC = () => {
  const {t} = useLang()
  const [loading, setLoading] = useState(false)
  const [dashboardData, setDashboardData] = useState<any>(null)
  const {handleErrorMessage} = useErrorHandler()
  const {hasPermission} = usePermissionContext()
  const [requisitionFunnelData, setRequisitionFunnelData] = useState<any>([])
  const [currentStockItemsQty, setCurrentStockItemsQty] = useState<any>(0)

  useEffect(() => {
    loadData()
    // const dashboard_api = new OauthApi();
    // setLoading(true);
    // dashboard_api
    //   .dashboardStats()
    //   .then((res) => {
    //     const payload = res?.data || {};
    //     console.log('Payload:', payload);
    //     setData(payload);
    //   })
    //   .finally(() => setLoading(false));
  }, [])

  const loadData = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      setLoading(true)
      OauthApi.dashboardStats()
        .then((res: any) => {
          setDashboardData(res.data)
          setRequisitionFunnelData(res.data?.requisitions?.funnel_data || [])
          setCurrentStockItemsQty(res.data?.current_stock_items_qty || 0)
          setLoading(false)
          resolve(res)
        })
        .catch((err: any) => {
          if (err?.status === 409) {
            handleErrorMessage(err)
          } else if (err?.status === 412) {
            handleErrorMessage(err)
          } else if (err?.status === 422) {
            handleErrorMessage(err)
          } else {
            handleErrorMessage(err)
          }
          setLoading(false)
          reject(err)
        })
    })
  }

  // FOR ENSURING WHEN USER HAS NO PERMISSIONS: SHOW WELCOME
  const hasDashboardPermission =
    hasPermission('auth:dashboard:pendingRequisitionCard') ||
    hasPermission('auth:dashboard:itemStockCard') ||
    hasPermission('auth:dashboard:demandVsStockCard') ||
    hasPermission('auth:dashboard:requesterWiseDisbursementCard') ||
    hasPermission('auth:dashboard:requisitionFlowBottlenecksCard') ||
    hasPermission('auth:dashboard:thanaWiseRequisitionOverview') ||
    hasPermission('auth:dashboard:demandvsStockIntelligence') ||
    hasPermission('auth:dashboard:twelveMonthsRequisitionReport') ||
    hasPermission('auth:dashboard:requisitionCard') ||
    hasPermission('auth:dashboard:goodsReceiveNoteCard') ||
    hasPermission('auth:dashboard:stockAdjustmentCard') ||
    hasPermission('auth:dashboard:requisitionPieChartCardStatus') ||
    hasPermission('auth:dashboard:goodsReceiveNotePieChartCardStatus') ||
    hasPermission('auth:dashboard:stockAdjustmentPieChartCardStatus') ||
    hasPermission('auth:dashboard:itemDisbursementStatistics') ||
    hasPermission('auth:dashboard:branchUser')

  return (
    <>
      <div className='row g-5 g-xl-8'>
        {hasPermission('auth:dashboard:pendingRequisitionCard') && (
          <div className='col-xl-3'>
            <StatisticsWidget5
              navigateTo='/admin/inventory/report/requisition-analytics?step_code=PENDING&dashboard=true'
              className='card-xl-stretch mb-xl-8'
              svgIcon='document'
              color='warning'
              iconColor='white'
              title={`+${dashboardData?.requisitions?.pending_qty}`}
              titleColor='white'
              description={t('Pending Requisitions')}
              descriptionColor='white'
            />
          </div>
        )}

        {hasPermission('auth:dashboard:itemStockCard') && (
          <div className='col-xl-3'>
            <StatisticsWidget5
              navigateTo='/admin/inventory/report/item-stock?stock_level=SAFE&dashboard=true'
              className='card-xl-stretch mb-5 mb-xl-8'
              svgIcon='chart-simple-3'
              color='success'
              iconColor='white'
              title={`+${currentStockItemsQty}`}
              titleColor='white'
              description={t('Current Stock Items(Yearly)')}
              descriptionColor='white'
            />
          </div>
        )}

        {hasPermission('auth:dashboard:itemStockCard') && (
          <div className='col-xl-3'>
            <StatisticsWidget5
              navigateTo='/admin/inventory/report/item-stock?stock_level=HIGH_DEMAND&dashboard=true'
              className='card-xl-stretch mb-xl-8'
              svgIcon='information-3'
              color='primary'
              iconColor='white'
              title={`+${dashboardData?.high_demand_items_qty}`}
              titleColor='white'
              description={t('High Demand Items')}
              descriptionColor='white'
            />
          </div>
        )}

        {hasPermission('auth:dashboard:requesterWiseDisbursementCard') && (
          <div className='col-xl-3'>
            <StatisticsWidget5
              navigateTo='/admin/inventory/report/item-stock?stock_level=ZERO_STOCK&dashboard=true'
              className='card-xl-stretch mb-xl-8'
              svgIcon='information-3'
              color='danger'
              iconColor='white'
              title={`+${dashboardData?.empty_stock_items_qty}`}
              titleColor='white'
              description={t('Zero Stock Items')}
              descriptionColor='white'
            />
          </div>
        )}
      </div>

      <div className='row g-5 g-xl-8 mb-8'>
        {/* Requisition Funnel */}
        {hasPermission('auth:dashboard:requisitionFlowBottlenecksCard') && (
          <div className='col-xl-6'>
            <RequisitionFunnel funnelDataValue={requisitionFunnelData} />
          </div>
        )}
        {/* Thana Wise Requisition Overview */}
        {hasPermission('auth:dashboard:thanaWiseRequisitionOverview') && (
          <div className='col-xl-6'>
            <ThanaRequisitionOverview />
          </div>
        )}
      </div>

      <div className='row g-5 g-xl-8 mb-2'>
        {/* Demand vs Stock Intelligence */}
        {hasPermission('auth:dashboard:demandvsStockIntelligence') && (
          <div className='col-xl-6'>
            <DemandVsStockWidget />
          </div>
        )}

        {/* Twelve Months Requisition Report */}
        {/* {hasPermission('auth:dashboard:twelveMonthsRequisitionReport') && (
          <div className='col-xl-6'>
            <div className='row g-5 g-xl-10 '>
              <div className='col-xl-12'>
                <ChartsWidget1
                  className='card-xl-stretch mb-xl-8'
                  seriesData={
                    Array.isArray(dashboardData?.requisitions_per_month)
                      ? dashboardData?.requisitions_per_month
                      : []
                  }
                />
              </div>
            </div>
          </div>
        )} */}
        {hasPermission('auth:dashboard:requesterWiseDisbursementCard') && (
          <div className='col-xl-6'>
            <div className='card card-flush'>
              <div className='card-body'>
                <div className='row g-2 g-xl-2'>
                  <div className='col-xl-12'>
                    <StatisticsWidget5
                      navigateTo='/admin/inventory/report/requester-wise-disbursement'
                      className='card-xl-stretch mb-xl-8'
                      svgIcon='information-3'
                      color='primary'
                      iconColor='white'
                      title=''
                      titleColor='white'
                      description={t('Requester Wise Disbursement Histories')}
                      descriptionColor='white'
                    />
                  </div>
                  <div className='col-xl-12'>
                    <StatisticsWidget5
                      navigateTo='/admin/inventory/report/branch-wise-disbursement'
                      className='card-xl-stretch mb-xl-8'
                      svgIcon='information-3'
                      color='primary'
                      iconColor='white'
                      title=''
                      titleColor='white'
                      description={t('DMP Unit Wise Disbursement Histories')}
                      descriptionColor='white'
                    />
                  </div>
                  <div className='col-xl-12'>
                    <StatisticsWidget5
                      navigateTo='/admin/inventory/report/item-wise-disbursement'
                      className='card-xl-stretch mb-xl-8'
                      svgIcon='information-3'
                      color='primary'
                      iconColor='white'
                      title=''
                      titleColor='white'
                      description={t('Item Wise Disbursement Histories')}
                      descriptionColor='white'
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FOR BRANCH USER */}
      {hasPermission('auth:dashboard:branchUser') && (
        <div className='row g-5 g-xl-10 mt-10'>
          <div className='col-xl-6'>
            <StatisticsWidget5
              navigateTo='/admin/inventory/requisition'
              className='card-xl-stretch mb-xl-8'
              svgIcon='document'
              color='primary'
              iconColor='white'
              // title={`+${dashboardData?.my_requisitions?.total_requisition_qty}`}
              title={t('Total user')}
              titleColor='white'
              description=''
              descriptionColor='white'
            />
          </div>

          <div className='col-xl-6'>
            <StatisticsWidget5
              navigateTo='/admin/inventory/requisition?newRequisition=true'
              className='card-xl-stretch mb-xl-8'
              svgIcon='document'
              color='success'
              iconColor='white'
              title={t('Earning')}
              titleColor='white'
              description=''
              descriptionColor='white'
            />
          </div>

        </div>
      )}

      {/* Not Used */}
      {hasDashboardPermission ? (
        <>
          <div className='row g-5 g-xl-10 mb-2'>
            {hasPermission('auth:dashboard:requisitionCard') && (
              <div className='col-xl-4 mb-9'>
                <CardsWidget1
                  className='h-100 mb-5 mb-xl-10'
                  totalQty={dashboardData?.requisitions?.total_record_qty}
                  pendingQty={dashboardData?.requisitions?.pending_qty}
                  approvedQty={dashboardData?.requisitions?.approved_qty}
                  rejectedQty={dashboardData?.requisitions?.rejected_qty}
                />
              </div>
            )}

            {hasPermission('auth:dashboard:goodsReceiveNoteCard') && (
              <div className='col-xl-4 mb-9'>
                <CardsWidget2
                  className='h-100 mb-5 mb-xl-10'
                  totalQty={dashboardData?.grn?.total_record_qty}
                  pendingQty={dashboardData?.grn?.pending_qty}
                  approvedQty={dashboardData?.grn?.approved_qty}
                  rejectedQty={dashboardData?.grn?.rejected_qty}
                />
              </div>
            )}

            {hasPermission('auth:dashboard:stockAdjustmentCard') && (
              <div className='col-xl-4 mb-9'>
                <CardsWidget3
                  className='h-100 mb-5 mb-xl-10'
                  totalQty={dashboardData?.stock_adjustments?.total_record_qty}
                  pendingQty={dashboardData?.stock_adjustments?.pending_qty}
                  approvedQty={dashboardData?.stock_adjustments?.approved_qty}
                  rejectedQty={dashboardData?.stock_adjustments?.rejected_qty}
                />
              </div>
            )}
          </div>

          <div className='row g-5 g-xl-10 mb-2'>
            {hasPermission('auth:dashboard:requisitionPieChartCardStatus') && (
              <div className='col-xl-6'>
                <PolarAreaWidget1
                  className='card-xl-stretch mb-xl-8'
                  title='Requisition Status'
                  status={dashboardData?.requisitions_status}
                  // ribbon={(
                  //   <div className="ribbon-label bg-primary text-white">
                  //     <KTIcon iconName='color-swatch' className='fs-1 text-white' />
                  //   </div>
                  // )}
                  series={[
                    dashboardData?.requisitions_status?.total_pending_qty ?? 0,
                    dashboardData?.requisitions_status?.total_approved_qty ?? 0,
                    dashboardData?.requisitions_status?.total_rejected_qty ?? 0,
                  ]}
                  labels={[t('Pending'), t('Approved'), t('Reject')]}
                  chartColor={'success'}
                  chartHeight='280px'
                />
              </div>
            )}
            {hasPermission('auth:dashboard:goodsReceiveNotePieChartCardStatus') && (
              <div className='col-xl-6'>
                <PolarAreaWidget2
                  className='card-xl-stretch mb-xl-8'
                  title='Goods Receive Note Status'
                  status={dashboardData?.grn_status}
                  // ribbon={(
                  //   <div className="ribbon-label bg-primary text-white">
                  //     <KTIcon iconName='color-swatch' className='fs-1 text-white' />
                  //   </div>
                  // )}
                  series={[
                    dashboardData?.grn_status?.total_pending_qty ?? 0,
                    dashboardData?.grn_status?.total_approved_qty ?? 0,
                    dashboardData?.grn_status?.total_rejected_qty ?? 0,
                  ]}
                  labels={[t('Pending'), t('Approved'), t('Reject')]}
                  chartColor={'success'}
                  chartHeight='280px'
                />
              </div>
            )}
          </div>
          <div className='row g-5 g-xl-10 '>
            {hasPermission('auth:dashboard:stockAdjustmentPieChartCardStatus') && (
              <div className='col-xl-6'>
                <PolarAreaWidget3
                  className='card-xl-stretch mb-xl-8'
                  title='Stock Adjustment Status'
                  status={dashboardData?.stock_adjustment_status}
                  // ribbon={(
                  //   <div className="ribbon-label bg-primary text-white">
                  //     <KTIcon iconName='color-swatch' className='fs-1 text-white' />
                  //   </div>
                  // )}
                  series={[
                    dashboardData?.stock_adjustment_status?.total_pending_qty ?? 0,
                    dashboardData?.stock_adjustment_status?.total_approved_qty ?? 0,
                    dashboardData?.stock_adjustment_status?.total_rejected_qty ?? 0,
                  ]}
                  labels={[t('Pending'), t('Approved'), t('Reject')]}
                  chartColor={'success'}
                  chartHeight='280px'
                />
              </div>
            )}
            {hasPermission('auth:dashboard:itemDisbursementStatistics') && (
              <div className='col-xl-6'>
                <RadialBarChartWidget1
                  className='card-xl-stretch mb-xl-8'
                  title={t('Item Disbursement Statistics')}
                  ribbon={
                    <div className='ribbon-label bg-primary text-white'>
                      <KTIcon iconName='color-swatch' className='fs-1 text-white' />
                    </div>
                  }
                  // series={[66.67, 10, 6.67, 16.67, 5]}
                  series={[
                    dashboardData?.item_disbursement_status?.total_submitted_qty ?? 0,
                    dashboardData?.item_disbursement_status?.total_delegated_qty ?? 0,
                    dashboardData?.item_disbursement_status?.total_approved_qty ?? 0,
                    dashboardData?.item_disbursement_status?.total_disbursed_qty ?? 0,
                    dashboardData?.item_disbursement_status?.total_acknowledged_qty ?? 0,
                  ]}
                  labels={[
                    t('Submitted'),
                    t('Delegated'),
                    t('Approved'),
                    t('Disbursed'),
                    t('Acknowledged'),
                  ]}
                  chartColor={'success'}
                  chartHeight='280px'
                />
              </div>
            )}
          </div>
        </>
      ) : (
        <div className='row g-5 g-xl-10'>
          <div className='col-xxl-12'>
            <EngageWidget10 className='h-md-100' />
          </div>
        </div>
      )}
    </>
  )
}

const DashboardWrapper: FC = () => {
  // const intl = useIntl()

  return (
    <>
      <PageTitle breadcrumbs={[]}>{/*intl.formatMessage({ id: 'MENU.DASHBOARD' })*/}</PageTitle>
      <DashboardPage />
    </>
  )
}

export {DashboardWrapper}
