import React, { FC } from 'react';
import { AmountFormatUtils, DateTimeUtils } from 'src/app/utils';
import { useLang } from 'src/app/hooks/useLang';
import { Select } from 'antd';

const GrnView: FC<any> = (props) => {
  const { Option } = Select;
  const { listData, financialYear, setFinancialYear } = props;
  const { t } = useLang();
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="card card-body position-relative">
      <Select
        showSearch
        defaultValue={financialYear}
        optionFilterProp="children"
        onChange={(value) => setFinancialYear(value)}
        filterOption={(input, option: any) =>
          option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
        className="text-center"
      >
        {years.map((year) => (
          <Option key={year} value={`${year}-${year + 1}`}>
            {t(`${year} - ${year + 1}`)}
          </Option>
        ))}
      </Select>

      <div className="table-responsive">
        <table className="table table-row-dashed table-row-gray-300 align-middle gs-0 gy-4">
          <thead>
            <tr>
              <th>{t('Financial Year')}</th>
              <th>{t('Receive No. (GRN)')}</th>
              <th>{t('Opening Balance')}</th>
              <th>{t('Received Qty')}</th>
              <th>{t('Total Balance')}</th>
              <th>{t('Received Date')}</th>
            </tr>
          </thead>

          <tbody>
            {listData.length === 0 && (
              <tr>
                <td colSpan={6} align="center">
                  {t('No data found!')}
                </td>
              </tr>
            )}
            {listData &&
              [...listData]
                .sort((a, b) =>
                  a.previous_year === true
                    ? -1
                    : b.previous_year === true
                      ? 1
                      : 0
                )
                .map((itemData, index) => {
                  return (
                    <React.Fragment key={index}>
                      <tr key={`${index}`} style={{ fontSize: 15 }}>
                        <td width={'10%'}>
                          {itemData.previous_year === true
                            ? t('Previous Years')
                            : t('Current Year')}
                        </td>
                        <td width={'10%'}>{itemData.grn_number}</td>
                        <td width={'10%'}>
                          {AmountFormatUtils.formatWithDecimal(
                            itemData.opening_balance
                          )}
                        </td>
                        <td width={'10%'}>
                          {AmountFormatUtils.formatWithDecimal(
                            itemData.received_qty
                          )}
                        </td>
                        <td width={'10%'}>
                          {AmountFormatUtils.formatWithDecimal(
                            itemData.total_balance
                          )}
                        </td>
                        <td width={'15%'}>
                          {DateTimeUtils.formatDate(itemData.grn_date) || '--'}
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default React.memo(GrnView);
