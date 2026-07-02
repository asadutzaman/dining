import {useEffect, useRef} from 'react'
import ApexCharts from 'apexcharts'
import {useThemeMode} from 'src/_metronic/partials'
import {getCSSVariableValue} from 'src/_metronic/assets/ts/_utils'

type Props = {
  className?: string
  data?: {BREAKFAST?: number; LUNCH?: number; DINNER?: number}
}

const DiningMealTypeDonut = ({className = '', data = {}}: Props) => {
  const chartRef = useRef<HTMLDivElement | null>(null)
  const {mode} = useThemeMode()

  const series = [Number(data.BREAKFAST || 0), Number(data.LUNCH || 0), Number(data.DINNER || 0)]
  const hasData = series.some((v) => v > 0)

  useEffect(() => {
    if (!chartRef.current || !hasData) {
      return
    }
    const chart = new ApexCharts(chartRef.current, chartOptions(series))
    chart.render()

    return () => {
      chart.destroy()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartRef, mode, data])

  return (
    <div className={`card card-flush ${className}`}>
      <div className='card-header pt-5'>
        <h3 className='card-title fw-bold text-gray-900'>Meal Type Mix (This Month)</h3>
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

const chartOptions = (series: number[]): ApexCharts.ApexOptions => {
  const warning = getCSSVariableValue('--bs-warning')
  const primary = getCSSVariableValue('--bs-primary')
  const info = getCSSVariableValue('--bs-info')
  const labelColor = getCSSVariableValue('--bs-gray-700')

  return {
    series: series,
    chart: {fontFamily: 'inherit', height: 300, type: 'donut'},
    labels: ['Breakfast', 'Lunch', 'Dinner'],
    colors: [warning, primary, info],
    stroke: {colors: ['#fff']},
    legend: {show: true, position: 'bottom', labels: {colors: labelColor}},
    dataLabels: {enabled: true},
    plotOptions: {pie: {donut: {labels: {show: true, total: {show: true, label: 'Tokens'}}}}},
  }
}

export {DiningMealTypeDonut}
