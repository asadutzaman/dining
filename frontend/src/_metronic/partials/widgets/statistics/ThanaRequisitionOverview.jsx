import React, {useEffect, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {ReportInvApi} from '../../../../app/api'
import {useLang} from 'src/app/hooks/useLang'

const ThanaRequisitionOverview = () => {
  const navigate = useNavigate()
  const [totalThana, setTotalThana] = useState(0)
  const [thanas, setThanas] = useState([])
  const {t} = useLang()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = () => {
    ReportInvApi.getItemRequisitionStatusReport({})
      .then((res) => {
        const data = res?.data?.results || []
        setTotalThana(res?.data?.totalThana || 0)
        const formattedData = data.map((item) => ({
          id: item.branch_id,
          name: item.branch_name,
          total: item.total_count,
          pending: item.pending_count,
          approved: item.approved_count,
          rejected: item.rejected_count,
          delayed: item.delayed_count,
        }))
        setThanas(formattedData)
      })
      .catch((err) => {
        console.error('Error fetching thana stats:', err)
      })
  }

  // Row color logic (JC friendly)
  const getRowClass = (pending, delayed) => {
    if (delayed > 2 || pending > 15) return 'bg-light-danger'
    if (pending > 5) return 'bg-light-warning'
    return 'bg-light-success'
  }

  // const totalThanas = thanas.length
  const activeThanas = thanas.filter((t) => t.total > 0).length
  // const delayedThanas = thanas.filter((t) => t.delayed > 0).length

  return (
    <div className='card card-flush h-lg-100'>
      {/* Header */}
      <div className='card-header pt-7'>
        <div className='card-title flex-column'>
          <span className='card-label fw-bold text-gray-800'>
            {t('DMP Unit Wise Requisition Statistics')}
          </span>
          <span className='text-gray-500 mt-1 fw-semibold fs-7'>
            {t('Click View All to view List')}
          </span>
        </div>

        <div className='card-toolbar'>
          <button
            className='btn btn-sm btn-light-primary'
            // onClick={() => navigate('/inventory/demand-vs-stock')}
            onClick={() =>
              navigate('/admin/inventory/report/requisition-statistics?dashboard=true')
            }
          >
            {t('View All')}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className='card-body pt-3'>
        {/* KPI Summary */}
        <div className='row mb-6'>
          <div className='col-6'>
            <div className='fw-bold fs-4'>{totalThana}</div>
            <div className='text-muted fs-7'>{t('Total Thanas')}</div>
          </div>
          <div className='col-6'>
            <div className='fw-bold fs-4 text-danger'>{activeThanas}</div>
            <div className='text-muted fs-7'>{t('Requisition From')}</div>
          </div>
          {/* <div className='col-4'>
            <div className='fw-bold fs-4 text-warning'>{delayedThanas}</div>
            <div className='text-muted fs-7'>
              {t('Request')} &gt; {t('Delay')}
            </div>
          </div> */}
        </div>

        <div className='table-responsive'>
          <table className='table table-row-dashed table-row-gray-300 align-middle gs-0 gy-4'>
            <thead>
              <tr className='fw-bold text-muted'>
                <th>{t('Thana')}</th>
                <th className='text-center'>{t('Total')}</th>
                <th className='text-center'>{t('Pending')}</th>
                <th className='text-center'>{t('Approved')}</th>
                <th className='text-center'>{t('Rejected')}</th>
                <th className='text-center'>{t('Delayed')}</th>
              </tr>
            </thead>

            <tbody>
              {thanas.map((thana) => (
                <tr
                  key={thana.id}
                  className={`cursor-pointer ${getRowClass(thana.pending, thana.delayed)}`}
                  // onClick={() =>
                  //   navigate(
                  //     `/admin/inventory/report/requisition-statistics?dashboard=true&branch_id=${thana.id}`
                  //   )
                  // }
                >
                  {/* Thana Name */}
                  <td>
                    <span className='fw-bold text-gray-800'>{thana.name}</span>
                  </td>

                  {/* Total */}
                  <td className='text-center'>
                    <span className='fw-semibold'>{thana.total}</span>
                  </td>

                  {/* Pending */}
                  <td className='text-center'>
                    <span
                      className={`badge ${
                        thana.pending > 15
                          ? 'badge-light-danger'
                          : thana.pending > 5
                          ? 'badge-light-warning'
                          : 'badge-light-success'
                      }`}
                    >
                      {thana.pending}
                    </span>
                  </td>

                  {/* Approved */}
                  <td className='text-center'>
                    <span className='badge badge-light-success'>{thana.approved}</span>
                  </td>

                  {/* Rejected */}
                  <td className='text-center'>
                    <span className='badge badge-light-dark'>{thana.rejected}</span>
                  </td>

                  {/* Delayed */}
                  <td className='text-center'>
                    <span
                      className={`badge ${
                        thana.delayed > 2
                          ? 'badge-light-danger'
                          : thana.delayed > 0
                          ? 'badge-light-warning'
                          : 'badge-light-success'
                      }`}
                    >
                      {thana.delayed}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className='d-flex gap-4 mt-4 fs-8 text-muted'>
          <span>
            <i className='bi bi-circle-fill text-success'></i> {t('Normal')}
          </span>
          <span>
            <i className='bi bi-circle-fill text-warning'></i> {t('High Load')}
          </span>
          <span>
            <i className='bi bi-circle-fill text-danger'></i> {t('Critical Delay')}
          </span>
        </div>
      </div>
    </div>
  )
}

export default ThanaRequisitionOverview
