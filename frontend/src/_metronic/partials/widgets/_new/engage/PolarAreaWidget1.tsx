import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { KTIcon, toAbsoluteUrl } from 'src/_metronic/helpers';
import { useThemeMode } from 'src/_metronic/partials';
import { getCSSVariableValue } from 'src/_metronic/assets/ts/_utils';
import ApexCharts, { ApexOptions } from 'apexcharts';
import { useLang } from 'src/app/hooks/useLang';

type Props = {
  className: string;
  description?: string;
  icon?: boolean;
  stats?: number;
  labelColor?: string;
  textColor?: string;
  ribbon?: any;
  title?: string;
  series: any;
  labels: any;
  chartColor: string;
  chartHeight: string;
  status?: any;
};

const PolarAreaWidget1 = ({
  className,
  description,
  stats,
  labelColor,
  textColor,
  ribbon,
  title,
  series,
  labels,
  chartColor,
  chartHeight,
  status,
}: Props) => {
  const [filterBy, setFilterBy] = useState<'all' | 'today' | 'month'>('all');
  useEffect(() => {
    (async () => {})();
  }, []);

  const chartRef = useRef<HTMLDivElement | null>(null);
  const { mode } = useThemeMode();
  const { t } = useLang();

  const getSeries = () => {
    if (!status) {
      return [0, 0, 0];
    }
    if (filterBy === 'today') {
      return [
        status?.pending_qty_per_current_day || 0,
        status?.approved_qty_per_current_day || 0,
        status?.rejected_qty_per_current_day || 0,
      ];
    }
    if (filterBy === 'month') {
      return [
        status?.pending_qty_per_current_month || 0,
        status?.approved_qty_per_current_month || 0,
        status?.rejected_qty_per_current_month || 0,
      ];
    }
    return [
      status?.total_pending_qty || 0,
      status?.total_approved_qty || 0,
      status?.total_rejected_qty || 0,
    ];
  };

  const checkData = () => {
    const currentSeries = getSeries();
    return currentSeries.some((Value) => Value > 0);
  };

  const refreshChart = () => {
    if (!chartRef.current) {
      return;
    }

    const chart = new ApexCharts(
      chartRef.current,
      chartOptions(getSeries(), labels, chartColor, chartHeight)
    );
    if (chart) {
      chart.render();
    }

    return chart;
  };

  useEffect(() => {
    if (!checkData()) return;

    const chart = refreshChart();
    let ro: ResizeObserver | null = null;
    if (chartRef.current) {
      ro = new ResizeObserver(() => {
        if (!chart) return;
        chart.updateOptions(
          chartOptions(getSeries(), labels, chartColor, chartHeight),
          true,
          true
        );
      });
      ro.observe(chartRef.current);
    }

    return () => {
      if (ro) ro.disconnect();
      if (chart) {
        chart.destroy();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartRef, mode, series, filterBy, status]);

  return (
    <div className={`card card-flush ${className}`}>
      <div className="card-header pt-5 ribbon ribbon-top ribbon-vertical">
        {ribbon}
        <h3 className="card-title d-flex align-items-center justify-content-between w-100">
          <span className="fw-bold text-gray-900">{t(title)}</span>
          <button
            type="button"
            className="btn btn-light-primary me-3 float-end"
            data-kt-menu-trigger="click"
            data-kt-menu-placement="bottom-end"
          >
            <KTIcon iconName="filter" className="fs-6" />
            {t('Filter')}
          </button>
          <div
            className="menu menu-sub menu-sub-dropdown w-300px w-md-325px"
            data-kt-menu="true"
          >
            {/* begin::Header */}
            <div className="px-7 py-5">
              <div className="fs-5 text-gray-900 fw-bolder">
                {t('Filter Options')}
              </div>
            </div>
            {/* end::Header */}

            {/* begin::Separator */}
            <div className="separator border-gray-200"></div>
            {/* end::Separator */}
            <div className="px-7 py-5" data-kt-user-table-filter="form">
              <div className="mb-10">
                <label className="form-label fs-6 fw-bold">
                  {t('Records By')}:
                </label>
                <select
                  className="form-select form-select-solid"
                  value={filterBy}
                  onChange={(e) =>
                    setFilterBy(e.target.value as 'all' | 'today' | 'month')
                  }
                >
                  <option value="all">{t('All')}</option>
                  <option value="today">{t('Today')}</option>
                  <option value="month">{t('This Month')}</option>
                </select>
              </div>
            </div>
          </div>
        </h3>
      </div>
      <div className="card-body pt-0">
        {checkData() ? (
          <div className="d-flex flex-column">
            <div className="flex-grow-1">
              <div
                ref={chartRef}
                className="mixed-widget-4-chart"
                style={{ width: '100%' }}
              ></div>
            </div>
          </div>
        ) : (
          <div className="d-flex flex-center flex-column flex-grow-1 h-100 py-10">
            <span className="fs-4 fw-semibold text-gray-400 mb-2">
              No Data Available
            </span>
            <span className="fs-6 text-gray-400">
              {filterBy === 'today' && 'No Records Found For Today'}
              {filterBy === 'month' && 'No Records Found For This Month'}
              {filterBy === 'all' && 'No Records Found'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const chartOptions = (
  series: any = [],
  labels: any = [],
  chartColor: string,
  chartHeight: string
): any => {
  const baseColor = getCSSVariableValue('--bs-' + chartColor);
  const lightColor = getCSSVariableValue('--bs-' + chartColor + '-light');
  const labelColor = getCSSVariableValue('--bs-gray-700');

  return {
    series: series,
    chart: {
      fontFamily: 'inherit',
      height: chartHeight,
      type: 'pie',
      // offsetY: -15,
      // sparkline: {
      //   enabled: true
      // }
    },
    plotOptions: {
      // polarArea: {
      //   rings: {
      //     strokeWidth: 0
      //   },
      //   spokes: {
      //     strokeWidth: 0
      //   },
      // }
    },
    yaxis: {
      show: false,
    },
    // colors: [baseColor],
    stroke: {
      // lineCap: 'round',
      colors: ['#fff'],
    },
    labels: labels,
    legend: {
      show: true,
    },
    grid: {
      padding: {
        // top: -15,
        // bottom: -15
      },
    },
  };
};

export { PolarAreaWidget1 };
