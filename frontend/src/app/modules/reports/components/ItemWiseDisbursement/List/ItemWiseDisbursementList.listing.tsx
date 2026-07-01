import { Card, Spin } from 'antd';
import React, { FC } from 'react';
import ReportHeader from 'src/app/components/Header/ReportHeader';
import { useLang } from 'src/app/hooks/useLang';

const ItemWiseDisbursementListing: FC<any> = (props) => {
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
            <ReportHeader title={t('Item Wise Disbursement Report')} />
            {/* <div className="text-center fw-bold">
                Item: [{itemInfo?.code}]-{itemInfo?.name_en}
            </div> */}

            <table
              id="table-to-xls"
              className="table table-bordered table-row-gray-300 gs-2 gy-0"
            >
              <thead>
                <tr>
                  <th>{t('Serial No.')}</th>
                  <th>{t('Requester Name')}</th>
                  <th>{t('DMP Unit')}</th>
                  <th>{t('No of Requisitions')}</th>
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
                          <td width={'15%'}>{itemData.requester_name}</td>
                          <td width={'10%'}>{itemData.dmp_unit}</td>
                          <td width={'10%'}>{itemData.no_of_requisitions}</td>
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

export default React.memo(ItemWiseDisbursementListing);
