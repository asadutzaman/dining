import React, { FC } from 'react';
import { useLang } from 'src/app/hooks/useLang';
import { DateTimeUtils } from 'src/app/utils';
import { StatusEnum } from 'src/app/utils/enums';

const StockTransferItemViewTab: FC<any> = (props) => {
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
            <th>{t('Transfer To')}</th>
            <th>{t('Quantity')}</th>
            <th>{t('Remarks')}</th>
          </tr>
        </thead>

        <tbody>
          {itemData.stockTransferItemsListData !== undefined &&
            itemData.stockTransferItemsListData.map((item: any, index: any) => (
              <tr key={`local-${index}`}>
                <td>{++index}</td>
                <td>{item.item_info.name_en ?? item.item_info.name_bn}</td>
                <td>{item.item_info.code}</td>
                <td>
                  {Array.isArray(itemData.transfer_to_branch)
                    ? itemData.transfer_to_branch.map((branch: any) => branch.branch_name).join(', ')
                    : itemData.transfer_to_branch}
                </td>
                <td>{item.quantity}</td>
                <td>{item.remarks}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};
export default React.memo(StockTransferItemViewTab);
