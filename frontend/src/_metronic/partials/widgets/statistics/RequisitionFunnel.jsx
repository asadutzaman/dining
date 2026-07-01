import React from 'react'
import Chart from 'react-apexcharts'
import {useNavigate} from 'react-router-dom'
import {useLang} from 'src/app/hooks/useLang'

const RequisitionFunnel = (props) => {
  const navigate = useNavigate()
  const {funnelDataValue} = props
  const {t} = useLang()

  const funnelData = [
    {
      step: t('Pending Requisitions'),
      step_code: 'PENDING',
      value: funnelDataValue?.pending_qty || 0,
    },
    {step: t('Delegated'), step_code: 'DELEGATED', value: funnelDataValue?.delegated_qty || 0},
    {step: t('Approved'), step_code: 'APPROVED', value: funnelDataValue?.approved_qty || 0},
    {step: t('Disbursed'), step_code: 'DISBURSED', value: funnelDataValue?.disbursed_qty || 0},
  ]

  const series = [
    {
      name: 'Requisitions',
      data: funnelData.length > 0 && funnelData.map((item) => item.value),
    },
  ]

  // admin/inventory/report/requisition-analytics?step_code=DELEGATION&dashboard=true
  const options = {
    chart: {
      type: 'bar',
      height: 350,
      toolbar: {show: false},
      events: {
        dataPointSelection: (event, chartContext, config) => {
          const step_code = funnelData[config.dataPointIndex].step_code
          navigate(
            `/admin/inventory/report/requisition-analytics?step_code=${step_code}&dashboard=true`
          )
        },
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '90%',
        distributed: true,
        borderRadius: 6,
      },
    },
    colors: [
      '#FF9F43', // Requested
      '#1BC5BD', // Delegated
      '#3699FF', // Approved
      '#50CD89', // Disbursed
    ],
    dataLabels: {
      enabled: true,
      //   formatter: (val, opts) => `${funnelData[opts.dataPointIndex].step}: ${val}`,
      formatter: (val, opts) => `${val}`,
      style: {
        fontSize: '14px',
        fontWeight: 600,
        colors: ['#fff'],
      },
    },
    xaxis: {
      categories: funnelData.map((item) => item.step),
      labels: {show: false},
    },
    yaxis: {
      labels: {
        style: {
          fontSize: '13px',
          fontWeight: 600,
        },
      },
    },
    grid: {
      borderColor: '#EFF2F5',
      strokeDashArray: 4,
    },
    tooltip: {
      custom: ({dataPointIndex}) => {
        const item = funnelData[dataPointIndex]
        return `
          <div class="p-3">
            <strong>${item.step}</strong><br/>
            Requisitions: ${item.value}<br/>
            <span class="text-primary">Click to view list</span>
          </div>
        `
      },
    },
  }

  return (
    <div className='card card-flush h-lg-100'>
      {/* Header */}
      <div className='card-header pt-7'>
        <div className='card-title flex-column'>
          <span className='card-label fw-bold text-gray-800'>
            {t('Requisition Flow & Bottlenecks')}
          </span>
          <span className='text-gray-500 mt-1 fw-semibold fs-7'>
            {t('Click any step to view details')}
          </span>
        </div>

        <div className='card-toolbar'>
          <button
            className='btn btn-sm btn-light-primary'
            onClick={() =>
              navigate('/admin/inventory/report/requisition-analytics?step_code=ALL&dashboard=true')
            }
          >
            <i className='ki-duotone ki-filter fs-3'></i>
            {t('View All')}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className='card-body pt-4'>
        <Chart options={options} series={series} type='bar' height={300} />
      </div>
    </div>
  )
}

export default RequisitionFunnel
