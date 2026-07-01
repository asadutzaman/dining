import { Card, Spin } from 'antd';
import React, { FC } from 'react';
import ReportHeader from 'src/app/components/Header/ReportHeader';
import { useLang } from 'src/app/hooks/useLang';

const RequesterWiseDisbursementListing: FC<any> = (props) => {
  const { pagination, loading, listData, userInfo } = props;
  let showingStart = (pagination?.currentPage - 1) * pagination?.pageSize + 1;

  const { t, lang } = useLang();
  const getRiskBadge = (risk) => {
    switch (risk) {
      case 'Critical':
        return 'badge-light-danger';
      case 'Low':
        return 'badge-light-warning';
      default:
        return 'badge-light-success';
    }
  };

  return (
    <div className="p-6">
      <Card className="mt-2">
        <Spin spinning={loading}>
          <div className="listing-page-content listing-page-content-collectionTargetReport">
            <ReportHeader title={t('Requester Wise Disbursement Report')} />
            <div className="text-center fw-bold">
              {t('Requester Name')}: {userInfo?.name} - [
              {userInfo?.designation?.title}
              ]
              <br />
              {t('DMP Unit')}: {userInfo?.branch?.name}
            </div>

            <table
              id="table-to-xls"
              className="table table-bordered table-row-gray-300 gs-2 gy-0"
            >
              <thead>
                <tr>
                  <th>{t('Serial No.')}</th>
                  <th>{t('Item')}</th>
                  <th>{t('Unit')}</th>
                  <th>{t('Requisition Number')}</th>
                  <th>{t('Total Requested Quantity')}</th>
                  <th>{t('Total Received Quantity')}</th>
                  <th>{t('Last Receive Date')}</th>
                </tr>
              </thead>

              <tbody>
                {listData.length === 0 && (
                  <tr>
                    <td colSpan={7} align="center">
                      {t('No data found!')}
                    </td>
                  </tr>
                )}

                {listData &&
                  listData.map((itemData, index) => {
                    return (
                      <React.Fragment key={index}>
                        <tr key={`${index}`} style={{ fontSize: 15 }}>
                          <td width={'5%'} align="center">
                            {showingStart++}
                          </td>
                          <td
                            width={'15%'}
                            style={{
                              minWidth: '120px',
                              wordBreak: 'break-all',
                            }}
                          >
                            {lang === 'en'
                              ? itemData.item_name_en
                              : itemData.item_name_bn}
                          </td>
                          <td width={'10%'}>{itemData.unit}</td>
                          <td width={'10%'}>{itemData.requisition_no}</td>
                          <td width={'10%'}>{itemData.total_requested_qty}</td>
                          <td width={'10%'}>{itemData.total_received_qty}</td>
                          <td width={'10%'}>{itemData.last_received_date}</td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </Spin>
      </Card>
    </div>
  );
};

export default React.memo(RequesterWiseDisbursementListing);
