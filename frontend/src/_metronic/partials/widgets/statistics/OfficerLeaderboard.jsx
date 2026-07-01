import React from 'react'
import {useNavigate} from 'react-router-dom'

const OfficerLeaderboard = () => {
  const navigate = useNavigate()

  // Example data (replace with API response)
  const officers = [
    {
      rank: 1,
      name: 'DC Rahman',
      role: 'DC',
      avgTime: 1.4,
      pending: 4,
      sla: 'good',
    },
    {
      rank: 2,
      name: 'ADC Karim',
      role: 'ADC',
      avgTime: 2.1,
      pending: 6,
      sla: 'warning',
    },
    {
      rank: 3,
      name: 'AC Hasib',
      role: 'AC',
      avgTime: 7.2,
      pending: 24,
      sla: 'critical',
    },
    {
      rank: 12,
      name: 'DC Babul',
      role: 'DC',
      avgTime: 9.2,
      pending: 24,
      sla: 'critical',
    },
  ]

  const slaBadge = (sla) => {
    switch (sla) {
      case 'good':
        return 'badge-light-success'
      case 'warning':
        return 'badge-light-warning'
      case 'critical':
        return 'badge-light-danger'
      default:
        return 'badge-light'
    }
  }

  const getRowClassBySLA = (sla) => {
    switch (sla) {
      case 'good':
        return 'bg-light-success'
      case 'warning':
        return 'bg-light-warning'
      case 'critical':
        return 'bg-light-danger'
      default:
        return ''
    }
  }

  return (
    <div className='card card-flush h-lg-100'>
      {/* Header */}
      <div className='card-header pt-7'>
        <div className='card-title flex-column'>
          <span className='card-label fw-bold text-gray-800'>Officer Performance Leaderboard</span>
          <span className='text-gray-500 mt-1 fw-semibold fs-7'>Fastest vs slowest approvals</span>
        </div>
      </div>

      {/* Body */}
      <div className='card-body pt-3'>
        <div className='table-responsive'>
          <table className='table table-row-dashed table-row-gray-300 align-middle gs-0 gy-4'>
            <thead>
              <tr className='fw-bold text-muted'>
                <th className='w-50px'>Rank</th>
                <th>Officer</th>
                <th className='text-center'>Avg Time</th>
                <th className='text-center'>Pending</th>
                <th className='text-center'>SLA</th>
              </tr>
            </thead>

            <tbody>
              {officers.map((officer) => (
                <tr
                  key={officer.rank}
                  className={`cursor-pointer ${getRowClassBySLA(officer.sla)}`}
                  onClick={() => navigate(`/officers/${officer.name.replace(' ', '-')}`)}
                >
                  {/* Rank */}
                  <td>
                    <span className='badge badge-light-primary fw-bold'>{officer.rank}</span>
                  </td>

                  {/* Officer */}
                  <td>
                    <div className='d-flex align-items-center'>
                      {/* <div className='symbol symbol-45px me-3'>
                        <span className='symbol-label bg-light-primary text-primary fw-bold'>
                          {officer.name.charAt(0)}
                        </span>
                      </div> */}
                      <div className='d-flex flex-column'>
                        <span className='text-gray-800 fw-bold'>{officer.name}</span>
                        <span className='text-gray-500 fs-7'>{officer.role}</span>
                      </div>
                    </div>
                  </td>

                  {/* Avg Time */}
                  <td className='text-center'>
                    <span className='fw-bold text-gray-800'>{officer.avgTime} d</span>
                  </td>

                  {/* Pending */}
                  <td className='text-center'>
                    <span
                      className={`badge ${
                        officer.pending > 15
                          ? 'badge-light-danger'
                          : officer.pending > 5
                          ? 'badge-light-warning'
                          : 'badge-light-success'
                      }`}
                    >
                      {officer.pending}
                    </span>
                  </td>

                  {/* SLA */}
                  <td className='text-center'>
                    <span className={`badge ${slaBadge(officer.sla)} fw-semibold`}>
                      {officer.sla.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer hint */}
        <div className='text-muted fs-8 mt-4'>Click any officer to view pending requisitions</div>
      </div>
    </div>
  )
}

export default OfficerLeaderboard
