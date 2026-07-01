import { FC, useEffect, useRef } from 'react';
import { KTIcon } from '../../../../helpers';
import { getCSSVariableValue } from '../../../../assets/ts/_utils';
import { useThemeMode } from '../../../layout/theme-mode/ThemeModeProvider';
import { useLang } from 'src/app/hooks/useLang';

type Props = {
  className: string;
  chartSize?: number;
  chartLine?: number;
  chartRotate?: number;

  // API
  totalQty?: number;
  pendingQty?: number;
  approvedQty?: number;
  rejectedQty?: number;
};

const CardsWidget3: FC<Props> = ({
  className,
  chartSize = 70,
  chartLine = 11,
  chartRotate = 145,

  // API
  totalQty = 0,
  pendingQty = 0,
  approvedQty = 0,
  rejectedQty = 0,
}) => {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const { mode } = useThemeMode();
  const { t } = useLang();

  useEffect(() => {
    refreshChart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const refreshChart = () => {
    if (!chartRef.current) {
      return;
    }

    setTimeout(() => {
      initChart(chartSize, chartLine, chartRotate);
    }, 10);
  };

  return (
    <div className={`card card-flush ${className}`}>
      <div className="card-header pt-5">
        <div className="card-title d-flex flex-column">
          <div className="d-flex align-items-center">
            <span className="fs-4 fw-semibold text-gray-500 me-1 align-self-start">
              {/* $ */}
            </span>

            <span className="fs-2hx fw-bold text-gray-900 me-2 lh-1 ls-n2">
              {t('Stock Adjustment')}
            </span>

            <span className="badge badge-light-success fs-base">
              {/* <KTIcon iconName="arrow-up" className="fs-5 text-success ms-n1" /> */}
              {/* {t('Stock Adjustment')} */}
            </span>
          </div>
          <span className="text-gray-500 pt-1 fw-semibold fs-6">
            {totalQty}
          </span>
        </div>
      </div>

      <div className="card-body pt-2 pb-4 d-flex flex-wrap align-items-center">
        <div className="d-flex flex-center me-5 pt-2">
          <div
            id="kt_card_widget_3_chart"
            ref={chartRef}
            style={{ minWidth: chartSize + 'px', minHeight: chartSize + 'px' }}
            data-kt-size={chartSize}
            data-kt-line={chartLine}
          ></div>
        </div>

        <div className="d-flex flex-column content-justify-center flex-row-fluid">
          <div className="d-flex fw-semibold align-items-center my-3">
            <div className="bullet w-8px h-3px rounded-2 bg-primary me-3"></div>
            <div className="text-gray-500 flex-grow-1 me-4">
              {t('Pending Quantity')}
            </div>
            <div className="fw-bolder text-gray-700 text-xxl-end">
              {pendingQty}
            </div>
          </div>
          <div className="d-flex fw-semibold align-items-center">
            <div className="bullet w-8px h-3px rounded-2 bg-success me-3"></div>
            <div className="text-gray-500 flex-grow-1 me-4">
              {t('Approved Quantity')}
            </div>
            <div className=" fw-bolder text-gray-700 text-xxl-end">
              {approvedQty}
            </div>
          </div>
          <div className="d-flex fw-semibold align-items-center my-3">
            <div className="bullet w-8px h-3px rounded-2 bg-danger me-3"></div>
            <div className="text-gray-500 flex-grow-1 me-4">
              {t('Rejected Quantity')}
            </div>
            <div className="fw-bolder text-gray-700 text-xxl-end">
              {rejectedQty}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const initChart = function (
  chartSize: number = 70,
  chartLine: number = 11,
  chartRotate: number = 145
) {
  const el = document.getElementById('kt_card_widget_3_chart');
  if (!el) {
    return;
  }
  el.innerHTML = '';

  const options = {
    size: chartSize,
    lineWidth: chartLine,
    rotate: chartRotate,
    //percent:  el.getAttribute('data-kt-percent') ,
  };

  const canvas = document.createElement('canvas');
  const span = document.createElement('span');

  //@ts-ignore
  if (typeof G_vmlCanvasManager !== 'undefined') {
    //@ts-ignore
    G_vmlCanvasManager.initElement(canvas);
  }

  const ctx = canvas.getContext('2d');
  canvas.width = canvas.height = options.size;

  el.appendChild(span);
  el.appendChild(canvas);

  ctx?.translate(options.size / 2, options.size / 2); // change center
  ctx?.rotate((-1 / 2 + options.rotate / 180) * Math.PI); // rotate -90 deg

  //imd = ctx.getImageData(0, 0, 240, 240);
  const radius = (options.size - options.lineWidth) / 2;

  const drawCircle = function (
    color: string,
    lineWidth: number,
    percent: number
  ) {
    percent = Math.min(Math.max(0, percent || 1), 1);
    if (!ctx) {
      return;
    }

    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2 * percent, false);
    ctx.strokeStyle = color;
    ctx.lineCap = 'round'; // butt, round or square
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  };

  // Init 2
  // drawCircle('#E4E6EF', options.lineWidth, 100 / 100);
  drawCircle(getCSSVariableValue('--bs-danger'), options.lineWidth, 100 / 100);
  drawCircle(getCSSVariableValue('--bs-primary'), options.lineWidth, 100 / 150);
  drawCircle(getCSSVariableValue('--bs-success'), options.lineWidth, 100 / 200);
};

export { CardsWidget3 };
