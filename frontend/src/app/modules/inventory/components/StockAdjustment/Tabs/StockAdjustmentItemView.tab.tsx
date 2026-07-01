import React, { FC } from 'react';
import { useLang } from 'src/app/hooks/useLang';
import { DateTimeUtils } from 'src/app/utils';
import { StatusEnum } from 'src/app/utils/enums';

const StockAdjustmentItemViewTab: FC<any> = (props) => {
  const { itemData } = props;
  const { t } = useLang();

  return (
    <div className="table-responsive">
      <table className="table table-bordered align-middle gs-1 gy-1">
        <thead>
          <tr>
            <th>{t('SL.')}</th>
            <th>{t('Item')}</th>
            <th>{t('Item Code')}</th>
            <th>{t('Quantity')}</th>
            <th>{t('Remark')}</th>
          </tr>
        </thead>

        <tbody>
          {itemData.stock_adjustment_items_list_data !== undefined &&
            itemData.stock_adjustment_items_list_data.map(
              (localItem: any, localIndex: any) => (
                <tr key={`local-${localIndex}`}>
                  <td>{++localIndex}</td>
                  <td>{localItem.item_info.name_en}</td>
                  <td>{localItem.item_info.code}</td>
                  <td>{localItem.quantity}</td>
                  <td>{localItem.remarks}</td>
                </tr>
              )
            )}
        </tbody>
      </table>
    </div>
  );
};
export default React.memo(StockAdjustmentItemViewTab);
