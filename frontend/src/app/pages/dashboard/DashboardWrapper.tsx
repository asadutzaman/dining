/* eslint-disable jsx-a11y/anchor-is-valid */
import {FC, useCallback, useEffect, useState} from 'react'
import {PageTitle} from '../../../_metronic/layout/core'
import {EngageWidget10, StatisticsWidget5} from '../../../_metronic/partials/widgets'
import {DiningReportApi} from 'src/app/api'
import {DiningTrendChart} from 'src/app/modules/dining/components/Dashboard/DiningTrendChart'
import {DiningMealTypeDonut} from 'src/app/modules/dining/components/Dashboard/DiningMealTypeDonut'
import {DiningPaidVsDueBar} from 'src/app/modules/dining/components/Dashboard/DiningPaidVsDueBar'
import {DiningMemberTypeDonut} from 'src/app/modules/dining/components/Dashboard/DiningMemberTypeDonut'
import {DiningTopDues} from 'src/app/modules/dining/components/Dashboard/DiningTopDues'
import {usePermissionContext} from 'src/app/hooks/context/usePermissionContext'
import {useLang} from 'src/app/hooks/useLang'

const DashboardPage: FC = () => {
  const {t} = useLang()
  const {hasPermission} = usePermissionContext()
  const [diningStats, setDiningStats] = useState<any>(null)
  const [refreshing, setRefreshing] = useState(false)

  const canViewDining = hasPermission('auth:diningDashboard:view')

  const loadDiningStats = useCallback(() => {
    if (!canViewDining) {
      return
    }
    setRefreshing(true)
    DiningReportApi.getDashboardStats()
      .then((res: any) => setDiningStats(res.data))
      .catch(() => setDiningStats(null))
      .finally(() => setRefreshing(false))
  }, [canViewDining])

  // Fetch on mount, and again whenever the dashboard tab regains focus.
  useEffect(() => {
    loadDiningStats()
    window.addEventListener('focus', loadDiningStats)
    return () => window.removeEventListener('focus', loadDiningStats)
  }, [loadDiningStats])

  if (!canViewDining) {
    return (
      <div className='row g-5 g-xl-10'>
        <div className='col-xxl-12'>
          <EngageWidget10 className='h-md-100' />
        </div>
      </div>
    )
  }

  return (
    <>
      {/* DINING ANALYTICS */}
      <div className='d-flex justify-content-between align-items-center mb-5'>
        <h2 className='fw-bold text-gray-900 m-0'>{t('Dining Analytics')}</h2>
        <button
          type='button'
          className='btn btn-sm btn-light-primary'
          onClick={loadDiningStats}
          disabled={refreshing}
        >
          {refreshing ? t('Refreshing...') : t('Refresh')}
        </button>
      </div>

      <div className='row g-5 g-xl-8'>
        <div className='col-xl-3'>
          <StatisticsWidget5
            navigateTo='/admin/dining/meal-token'
            className='card-xl-stretch mb-xl-8'
            svgIcon='basket'
            color='primary'
            iconColor='white'
            title={`${diningStats?.kpi?.tokens_today ?? 0}`}
            titleColor='white'
            description={t('Tokens Issued Today')}
            descriptionColor='white'
          />
        </div>
        <div className='col-xl-3'>
          <StatisticsWidget5
            navigateTo='/admin/dining/payment'
            className='card-xl-stretch mb-xl-8'
            svgIcon='dollar'
            color='success'
            iconColor='white'
            title={`${diningStats?.kpi?.revenue_today ?? 0}`}
            titleColor='white'
            description={t('Revenue Collected Today')}
            descriptionColor='white'
          />
        </div>
        <div className='col-xl-3'>
          <StatisticsWidget5
            navigateTo='/admin/dining/payment/collect'
            className='card-xl-stretch mb-xl-8'
            svgIcon='information-3'
            color='danger'
            iconColor='white'
            title={`${diningStats?.kpi?.total_due ?? 0}`}
            titleColor='white'
            description={t('Total Outstanding Due')}
            descriptionColor='white'
          />
        </div>
        <div className='col-xl-3'>
          <StatisticsWidget5
            navigateTo='/admin/dining/member'
            className='card-xl-stretch mb-xl-8'
            svgIcon='people'
            color='warning'
            iconColor='white'
            title={`${diningStats?.kpi?.active_members ?? 0}`}
            titleColor='white'
            description={t('Active Members')}
            descriptionColor='white'
          />
        </div>
      </div>

      <div className='row g-5 g-xl-8'>
        <div className='col-xl-8'>
          <DiningTrendChart className='mb-xl-8' data={diningStats?.trend || []} />
        </div>
        <div className='col-xl-4'>
          <DiningMealTypeDonut className='mb-xl-8' data={diningStats?.meal_type_distribution || {}} />
        </div>
      </div>

      <div className='row g-5 g-xl-8'>
        <div className='col-xl-8'>
          <DiningPaidVsDueBar className='mb-xl-8' data={diningStats?.paid_vs_due || []} />
        </div>
        <div className='col-xl-4'>
          <DiningMemberTypeDonut className='mb-xl-8' data={diningStats?.member_type_distribution || {}} />
        </div>
      </div>

      <div className='row g-5 g-xl-8 mb-8'>
        <div className='col-xl-12'>
          <DiningTopDues data={diningStats?.top_dues || []} />
        </div>
      </div>
    </>
  )
}

const DashboardWrapper: FC = () => {
  return (
    <>
      <PageTitle breadcrumbs={[]} />
      <DashboardPage />
    </>
  )
}

export {DashboardWrapper}
