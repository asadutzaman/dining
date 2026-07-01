import {useEffect, useRef, FC, useState, Fragment} from 'react'
import ApexCharts, {ApexOptions} from 'apexcharts'
import {KTIcon} from 'src/_metronic/helpers'
import {getCSS, getCSSVariableValue} from 'src/_metronic/assets/ts/_utils'
import {useThemeMode} from 'src/_metronic/partials/layout/theme-mode/ThemeModeProvider'
import {Select} from 'antd'
import {useLang} from 'src/app/hooks/useLang'
import {t} from 'i18next'

type Props = {
  className: string
  seriesData?: number[]
}

const ChartsWidget1: FC<Props> = ({className, seriesData = []}) => {
  const chartRef = useRef<HTMLDivElement | null>(null)
  const {mode} = useThemeMode()
  const {Option} = Select
  const {t} = useLang()

  const baseSeries = [
    {
      name: t('Requisition'),
      color: getCSSVariableValue('--bs-danger'),
      type: 'bar',
      data: seriesData.length ? seriesData : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
  ]
  const [visibleSeries, setVisibleSeries] = useState([true, true])
  const [seriesTypes, setSeriesTypes] = useState(['bar', 'line'])

  const handleCheckboxChange = (index: number) => {
    setVisibleSeries((prev) => prev.map((v, i) => (i === index ? !v : v)))
  }
  const handleSeriesTypeChange = (index: number, type: string) => {
    setSeriesTypes((prev) => prev.map((t, i) => (i === index ? type : t)))
  }

  const series = baseSeries
    .map((s, i) => ({
      ...s,
      type: seriesTypes[i] as 'bar' | 'line',
      visible: visibleSeries[i],
    }))
    .filter((s) => s.visible)

  const refreshChart = () => {
    if (!chartRef.current) {
      return
    }

    const height = parseInt(getCSS(chartRef.current, 'height'))

    const chart = new ApexCharts(chartRef.current, getChartOptions(height, series))
    if (chart) {
      chart.render()
    }

    return chart
  }

  useEffect(() => {
    const chart = refreshChart()

    return () => {
      if (chart) {
        chart.destroy()
      }
    }
  }, [chartRef, mode, series])

  return (
    <div className={`card ${className}`}>
      {/* begin::Header */}
      <div className='card-header border-0 pt-5'>
        {/* begin::Title */}
        <h3 className='card-title align-items-start flex-column'>
          <span className='card-label fw-bold fs-3 mb-1'>{t('12 Months Requisition Report')}</span>
          <span className='text-muted fw-semibold fs-7'>{t('12 Months')}</span>
        </h3>
        {/* end::Title */}

        {/* begin::Toolbar */}
        <div className='card-toolbar'></div>
        {/* end::Toolbar */}
      </div>
      {/* end::Header */}

      {/* begin::Body */}
      <div className='card-body pt-1'>
        {/* begin::Chart */}
        <div ref={chartRef} id='kt_charts_widget_1_chart' style={{height: '320px'}} />
        {/* end::Chart */}
        <div className='mb-0 d-flex justify-content-center'>
          {baseSeries.map((s, i) => (
            <Fragment key={i}>
              <div
                className={
                  'form-check form-check-custom form-check-solid me-5 form-check-sm form-check-info'
                }
                key={s.name}
              >
                <input
                  className='form-check-input'
                  type='checkbox'
                  value=''
                  id={'flexCheckDefault' + s.name}
                  checked={visibleSeries[i]}
                  onChange={() => handleCheckboxChange(i)}
                />
                <label className='form-check-label' htmlFor='flexCheckDefault'>
                  {s.name}
                </label>
              </div>
              <Select
                className='m-0 me-5'
                size='small'
                placeholder='Select...'
                value={seriesTypes[i]}
                onChange={(value) => {
                  handleSeriesTypeChange(i, value as string)
                }}
              >
                <Option value='bar'>{t('Bar')}</Option>
                <Option value='line'>{t('Line')}</Option>
              </Select>
            </Fragment>
          ))}
        </div>
      </div>
      {/* end::Body */}
    </div>
  )
}

export {ChartsWidget1}

function getChartOptions(height: number, series: any = []): ApexOptions {
  const labelColor = getCSSVariableValue('--bs-gray-500')
  const borderColor = getCSSVariableValue('--bs-gray-200')
  const baseColor = getCSSVariableValue('--bs-primary')
  const secondaryColor = getCSSVariableValue('--bs-success')
  const salesColor = getCSSVariableValue('--bs-warning')

  const getResponsiveColumnWidth = () => {
    const width = window.innerWidth
    if (width < 576) {
      // xs screens
      return '90%'
    } else if (width < 768) {
      // sm screens
      return '80%'
    } else if (width < 992) {
      // md screens
      return '70%'
    } else if (width < 1200) {
      // lg screens
      return '50%'
    } else {
      // xl screens and up
      return '40%'
    }
  }

  return {
    series: series,
    chart: {
      fontFamily: 'inherit',
      // stacked: true,
      height: height,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: getResponsiveColumnWidth(),
        borderRadius: 3,
      },
    },
    legend: {
      show: false,
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth',
      show: true,
      // width: 3,
      colors: ['transparent'],
      // colors: [baseColor, 'transparent', 'transparent'],
    },
    xaxis: {
      categories: [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: labelColor,
          fontSize: '12px',
        },
      },
    },
    yaxis: {
      labels: {
        formatter: function (value: number) {
          const absValue = Math.abs(value)
          const sign = value < 0 ? '-' : ''
          if (absValue >= 1_000_000_000) return sign + (absValue / 1_000_000_000).toFixed(1) + ' B'
          if (absValue >= 1_000_000) return sign + (absValue / 1_000_000).toFixed(1) + ' M'
          if (absValue >= 1_000) return sign + (absValue / 1_000).toFixed(1) + ' k'
          return String(value)
        },
        style: {
          colors: labelColor,
          fontSize: '12px',
        },
      },
    },
    fill: {
      opacity: 1,
    },
    states: {
      normal: {
        filter: {
          type: 'none',
          value: 0,
        },
      },
      hover: {
        filter: {
          type: 'none',
          value: 0,
        },
      },
      active: {
        allowMultipleDataPointsSelection: false,
        filter: {
          type: 'none',
          value: 0,
        },
      },
    },
    tooltip: {
      style: {
        fontSize: '12px',
      },
      y: {
        formatter: function (val) {
          return '' + val.toLocaleString() + ''
        },
      },
    },
    colors: [baseColor, secondaryColor, salesColor],
    grid: {
      borderColor: borderColor,
      strokeDashArray: 4,
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    markers: {
      colors: 'white',
      strokeColors: [baseColor, secondaryColor, salesColor],
      strokeWidth: 3,
      size: 5,
    },
  }
}
