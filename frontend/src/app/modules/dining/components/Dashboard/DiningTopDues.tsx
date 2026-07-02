import {FC} from 'react'
import {Link} from 'react-router-dom'

type DueRow = {member_id: number; member_code: string; name: string; due_balance: number}

type Props = {
  className?: string
  data?: DueRow[]
}

const DiningTopDues: FC<Props> = ({className = '', data = []}) => {
  return (
    <div className={`card card-flush ${className}`}>
      <div className='card-header pt-5'>
        <h3 className='card-title fw-bold text-gray-900'>Top Outstanding Dues</h3>
      </div>
      <div className='card-body pt-2'>
        {data.length === 0 ? (
          <div className='d-flex flex-center flex-column py-10'>
            <span className='fs-4 fw-semibold text-gray-400'>No Outstanding Dues</span>
          </div>
        ) : (
          <div className='table-responsive'>
            <table className='table table-row-dashed align-middle gs-0 gy-3'>
              <thead>
                <tr className='fw-bold text-muted'>
                  <th>Member</th>
                  <th className='text-end'>Due Balance</th>
                  <th className='text-end'>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row.member_id}>
                    <td>
                      <span className='text-gray-900 fw-bold d-block'>{row.name}</span>
                      <span className='text-muted fs-7'>{row.member_code}</span>
                    </td>
                    <td className='text-end text-danger fw-bold'>{row.due_balance}</td>
                    <td className='text-end'>
                      <Link to='/admin/dining/payment/collect' className='btn btn-sm btn-light-primary'>
                        Collect
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export {DiningTopDues}
