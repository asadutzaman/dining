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
};

const RadialBarChartWidget1 = ({
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
}: Props) => {
  useEffect(() => {
    (async () => {})();
  }, []);

  const chartRef = useRef<HTMLDivElement | null>(null);
  const { mode } = useThemeMode();
  const { t } = useLang();

  const refreshChart = () => {
    if (!chartRef.current) {
      return;
    }

    const labelValue = '70%';

    const chart = new ApexCharts(
      chartRef.current,
      chartOptions(series, labels, chartColor, chartHeight, labelValue)
    );
    if (chart) {
      chart.render();
    }

    return chart;
  };

  useEffect(() => {
    const chart = refreshChart();
    let ro: ResizeObserver | null = null;
    if (chartRef.current) {
      ro = new ResizeObserver(() => {
        if (!chart) return;
        chart.updateOptions(
          chartOptions(series, labels, chartColor, chartHeight, '100%'),
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
  }, [chartRef, mode, series]);

  return (
    <div className={`card card-flush ${className}`}>
      <div className="card-header pt-5 ribbon ribbon-top ribbon-vertical">
        {ribbon}
        <h3 className="card-title align-items-start flex-column">
          <span className="fw-bold text-gray-900">{t(title)}</span>
        </h3>
      </div>
      <div className="card-body pt-0">
        <div className="d-flex flex-column">
          <div className="flex-grow-1">
            <div
              ref={chartRef}
              className="mixed-widget-4-chart"
              style={{ width: '100%' }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const chartOptions = (
  series: any = [],
  labels: any = [],
  chartColor: string,
  chartHeight: string,
  labelValue: string
): any => {
  const baseColor = getCSSVariableValue('--bs-' + chartColor);
  const lightColor = getCSSVariableValue('--bs-' + chartColor + '-light');
  const labelColor = getCSSVariableValue('--bs-gray-700');

  return {
    series: series,
    chart: {
      fontFamily: 'inherit',
      height: chartHeight,
      type: 'radialBar',
      // offsetY: -15,
      sparkline: {
        enabled: true,
      },
    },
    plotOptions: {
      radialBar: {
        startAngle: 0,
        endAngle: 360,
        hollow: {
          margin: 0,
          size: '30%',
        },
        dataLabels: {
          name: {
            show: true,
            fontWeight: '500',
          },
          value: {
            // color: labelColor,
            fontSize: '14px',
            fontWeight: '500',
            offsetY: 12,
            show: true,
            formatter: function (val: any) {
              return val;
            },
          },
        },
        track: {
          // background: lightColor,
          strokeWidth: '100%',
          // margin: 1,
        },
      },
    },
    yaxis: {
      show: false,
    },
    legend: {
      show: true,
    },
    // colors: [baseColor],
    stroke: {
      // lineCap: 'round',
      colors: ['#fff'],
    },
    labels: labels,
    grid: {
      padding: {
        // top: -15,
        // bottom: -15
      },
    },
  };
};

export { RadialBarChartWidget1 };
