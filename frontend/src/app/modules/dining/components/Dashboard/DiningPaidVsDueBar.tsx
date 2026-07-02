import {useEffect, useRef} from 'react'
import ApexCharts from 'apexcharts'
import {useThemeMode} from 'src/_metronic/partials'
import {getCSSVariableValue} from 'src/_metronic/assets/ts/_utils'
import {DateTimeUtils} from 'src/app/utils'

type PvdPoint = {date: string; paid_amount: number; due_amount: number}

type Props = {
  className?: string
  data?: PvdPoint[]
}

const DiningPaidVsDueBar = ({className = '', data = []}: Props) => {
  const chartRef = useRef<HTMLDivElement | null>(null)
  const {mode} = useThemeMode()

  const hasData = data.some((d) => d.paid_amount > 0 || d.due_amount > 0)

  useEffect(() => {
    if (!chartRef.current || !hasData) {
      return
    }
    const chart = new ApexCharts(chartRef.current, chartOptions(data))
    chart.render()

    return () => {
      chart.destroy()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartRef, mode, data])

  return (
    <div className={`card card-flush ${className}`}>
      <div className='card-header pt-5'>
        <h3 className='card-title fw-bold text-gray-900'>Paid vs Due (Last 7 Days)</h3>
      </div>
      <div className='card-body pt-2'>
        {hasData ? (
          <div ref={chartRef} style={{width: '100%'}} />
        ) : (
          <div className='d-flex flex-center flex-column py-10'>
            <span className='fs-4 fw-semibold text-gray-400'>No Data Available</span>
          </div>
        )}
      </div>
    </div>
  )
}

const chartOptions = (data: PvdPoint[]): ApexCharts.ApexOptions => {
  const success = getCSSVariableValue('--bs-success')
  const danger = getCSSVariableValue('--bs-danger')
  const labelColor = getCSSVariableValue('--bs-gray-500')
  const borderColor = getCSSVariableValue('--bs-gray-200')

  return {
    series: [
      {name: 'Paid', data: data.map((d) => Number(d.paid_amount))},
      {name: 'Due', data: data.map((d) => Number(d.due_amount))},
    ],
    chart: {fontFamily: 'inherit', height: 300, type: 'bar', stacked: true, toolbar: {show: false}},
    plotOptions: {bar: {columnWidth: '45%', borderRadius: 4}},
    colors: [success, danger],
    labels: data.map((d) => DateTimeUtils.formatDate(d.date)),
    xaxis: {
      labels: {style: {colors: labelColor, fontSize: '11px'}},
      axisBorder: {show: false},
    },
    yaxis: {labels: {style: {colors: labelColor}}},
    legend: {show: true, labels: {colors: labelColor}},
    grid: {borderColor: borderColor, strokeDashArray: 4},
    dataLabels: {enabled: false},
    tooltip: {shared: true, intersect: false},
  }
}

export {DiningPaidVsDueBar}
