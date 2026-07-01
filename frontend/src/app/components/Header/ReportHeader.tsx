import React from 'react';
import { toAbsoluteUrl } from 'src/_metronic/helpers';
import { useLang } from 'src/app/hooks/useLang';

interface Props {
  title: string;
  isShowContact?: boolean;
}

const ReportHeader: React.FC<Props> = ({ title, isShowContact = false }) => {
  const { t, isBangla } = useLang();
  return (
    <>
      <div
        className="text-center p-2 rounded"
        style={{ backgroundColor: '#f2f2f2' }}
      >
        <div className="d-flex align-items-center justify-content-center position-relative">
          <img
            alt={t('Logo')}
            src={toAbsoluteUrl(
              isBangla
                ? '/media/logos/dmp_logo_bn.png'
                : '/media/logos/dmp_logo.png'
            )}
            className="h-70px app-sidebar-logo-default position-absolute start-0"
          />

          <hgroup
            style={{ lineHeight: '30px', margin: '0', textAlign: 'center' }}
          >
            <h1 className="mb-0" style={{ color: '#666' }}>
              {t('Inventory & Requisition Management System')}
            </h1>

            <div className="mb-0 h6" style={{ color: '#666' }}>
              {t('Dhaka Metropolitan Police')}
            </div>

            <div className="mb-0 h6" style={{ color: '#666' }}>
              {t('Rajarbagh Police Lines')}
            </div>

            <div className="mb-0 h6" style={{ color: '#666' }}>
              {t('Website: www.police.gov.bd')}
              {/* <a href="https://www.police.gov.bd/" target="_blank" rel="noopener noreferrer">
                                {'www.police.gov.bd/'}
                            </a> */}
            </div>
            {isShowContact && (
              <div className="mb-0 h6" style={{ color: '#666' }}>
                {'Phone Number : 01733-048576'}
              </div>
            )}
          </hgroup>

          {/* <img
            alt="ISO_Logo"
            src={toAbsoluteUrl('/media/logos/iso.jpeg')}
            className="h-50px app-sidebar-logo-default mt-4"
          /> */}
        </div>
      </div>
      <h3 className="fw-bold my-3 text-center" style={{ fontSize: 20 }}>
        {title}
      </h3>
    </>
  );
};

export default ReportHeader;
