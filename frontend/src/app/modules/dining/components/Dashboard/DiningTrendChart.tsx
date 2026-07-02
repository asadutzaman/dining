import {useEffect, useRef} from 'react'
import ApexCharts from 'apexcharts'
import {useThemeMode} from 'src/_metronic/partials'
import {getCSSVariableValue} from 'src/_metronic/assets/ts/_utils'
import {DateTimeUtils} from 'src/app/utils'

type TrendPoint = {date: string; tokens_count: number; revenue: number}

type Props = {
  className?: string
  data?: TrendPoint[]
}

const DiningTrendChart = ({className = '', data = []}: Props) => {
  const chartRef = useRef<HTMLDivElement | null>(null)
  const {mode} = useThemeMode()

  const hasData = data.some((d) => d.tokens_count > 0 || d.revenue > 0)

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
        <h3 className='card-title fw-bold text-gray-900'>Tokens & Revenue (Last 14 Days)</h3>
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

const chartOptions = (data: TrendPoint[]): ApexCharts.ApexOptions => {
  const primary = getCSSVariableValue('--bs-primary')
  const success = getCSSVariableValue('--bs-success')
  const labelColor = getCSSVariableValue('--bs-gray-500')
  const borderColor = getCSSVariableValue('--bs-gray-200')

  return {
    series: [
      {name: 'Tokens', type: 'column', data: data.map((d) => d.tokens_count)},
      {name: 'Revenue', type: 'line', data: data.map((d) => Number(d.revenue))},
    ],
    chart: {fontFamily: 'inherit', height: 300, type: 'line', toolbar: {show: false}},
    stroke: {width: [0, 3], curve: 'smooth'},
    plotOptions: {bar: {columnWidth: '40%', borderRadius: 4}},
    colors: [primary, success],
    labels: data.map((d) => DateTimeUtils.formatDate(d.date)),
    xaxis: {
      labels: {style: {colors: labelColor, fontSize: '11px'}, rotate: -45, rotateAlways: false},
      axisBorder: {show: false},
      tickAmount: 7,
    },
    yaxis: [
      {title: {text: 'Tokens'}, labels: {style: {colors: labelColor}}},
      {opposite: true, title: {text: 'Revenue'}, labels: {style: {colors: labelColor}}},
    ],
    legend: {show: true, labels: {colors: labelColor}},
    grid: {borderColor: borderColor, strokeDashArray: 4},
    dataLabels: {enabled: false},
    tooltip: {shared: true, intersect: false},
  }
}

export {DiningTrendChart}
