import React, {useEffect, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {ReportInvApi} from 'src/app/api'
import {useLang} from 'src/app/hooks/useLang'

const demandData = [
  {
    item: '9mm Ammunition',
    stock: 1200,
    demand: 2800,
    risk: 'critical',
  },
  {
    item: 'Riot Helmet',
    stock: 500,
    demand: 820,
    risk: 'warning',
  },
  {
    item: 'Bulletproof Vest',
    stock: 300,
    demand: 310,
    risk: 'warning',
  },
  {
    item: 'Pilot Pen',
    stock: 500,
    demand: 820,
    risk: 'warning',
  },
]

const getRiskBadge = (risk) => {
  switch (risk) {
    case 'Risk':
      return 'warning'
    case 'Danger':
      return 'danger'
    default:
      return 'success'
  }
}

const DemandVsStockWidget = () => {
  const navigate = useNavigate()
  const {t} = useLang()
  const [listData, setListData] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = () => {
    let payload = {
      $queryParams: {
        logistic_id: 'ALL',
        stock_level: 'DEMAND_GT_STOCK',
      },
    }
    ReportInvApi.getItemStockReport(payload)
      .then((res) => {
        setListData(res.data.results?.slice(0, 4) || [])
      })
      .catch((err) => {
        console.error('Error fetching thana stats:', err)
      })
  }

  return (
    <div className='card card-flush'>
      {/* Header h-xl-100*/}
      <div className='card-header pt-5'>
        <h3 className='card-title fw-bold'>{t('Demand vs Stock Intelligence')}</h3>

        <div className='card-toolbar'>
          <button
            className='btn btn-sm btn-light-primary'
            onClick={() =>
              navigate(
                '/admin/inventory/report/item-stock?stock_level=DEMAND_GT_STOCK&dashboard=true'
              )
            }
          >
            {t('View All')}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className='card-body pt-5'>
        {/* KPI Summary */}
        {/* <div className='row mb-6'>
          <div className='col-4'>
            <div className='fw-bold fs-4'>5,042</div>
            <div className='text-muted fs-7'>{t('Total Items')}</div>
          </div>
          <div className='col-4'>
            <div className='fw-bold fs-4 text-danger'>2,031</div>
            <div className='text-muted fs-7'>
              {t('Demand')} &gt; {t('Stock')}
            </div>
          </div>
          <div className='col-4'>
            <div className='fw-bold fs-4 text-warning'>312</div>
            <div className='text-muted fs-7'>{t('Not in Stock')}</div>
          </div>
        </div> */}

        {/* Table */}
        <div className='table-responsive'>
          <table className='table table-row-dashed align-middle gs-0 gy-4'>
            <thead>
              <tr className='fw-bold text-muted fs-7'>
                <th>{t('Item')}</th>
                <th className='text-end'>{t('Stock')}</th>
                <th className='text-end'>{t('Demand')}</th>
                <th className='text-end'>{t('Gap')}</th>
                <th className='text-end'>{t('Risk')}</th>
              </tr>
            </thead>

            <tbody>
              {listData.length > 0 &&
                listData.map((row, idx) => (
                  <tr
                    key={idx}
                    className='cursor-pointer'
                    onClick={() => navigate(`/inventory/demand-vs-stock?item=${row.item}`)}
                  >
                    <td className='fw-bold'>{t(row.item_name_en || row.item_name_bn)}</td>
                    <td className='text-end'>{row.current_stock}</td>
                    <td className='text-end text-danger'>{row.running_demand}</td>
                    <td className='text-end fw-bold'>{row.demand_stock_gap}</td>
                    <td className='text-end'>
                      <span className={`badge badge-light-${getRiskBadge(row.risk_status)}`}>
                        {row.risk_status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Footer Hint */}
        <div className='text-muted fs-8 mt-4'>
          {t('Showing top risk items only. Click "View All" for complete inventory intelligence.')}
        </div>
      </div>
    </div>
  )
}

export default DemandVsStockWidget
