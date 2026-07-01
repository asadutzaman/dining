import React, { FC } from 'react';
import { useLang } from 'src/app/hooks/useLang';
import { DateTimeUtils } from 'src/app/utils';
import { StatusEnum } from 'src/app/utils/enums';
import { ReconcileStatusEnum } from 'src/app/utils/enums/Status.enum';

const StockTransferViewTab: FC<any> = (props) => {
  const { itemData } = props;
  const { t } = useLang();

  return (
    <div className="table-responsive">
      <table className="table table-row-dashed table-row-gray-300 align-middle gs-0 gy-1">
        <tr>
          <td width={'20%'}>{t('Stock Transfer Number')}</td>
          <td width={'5%'}>:</td>
          <td width={'75%'}>{itemData.stock_transfer_number}</td>
        </tr>
        <tr>
          <td width={'20%'}>{t('Reason')}</td>
          <td width={'5%'}>:</td>
          <td width={'75%'}>{itemData.reason}</td>
        </tr>
        <tr>
          <td width={'20%'}>{t('Transfer From Branch')}</td>
          <td width={'5%'}>:</td>
          <td width={'75%'}>{itemData.transfer_from_branch}</td>
        </tr>
        <tr>
          <td width={'20%'}>{t('Transfer To Branch')}</td>
          <td width={'5%'}>:</td>
          {/* <td width={'75%'}>{itemData.transfer_to_branch}</td> */}
          <td width={'75%'}>{itemData.transfer_to_branch?.map((branch: any) => branch.branch_name).join(', ')}</td>

        </tr>
        <tr>
          <td width={'20%'}>{t('Process Status')}</td>
          <td width={'5%'}>:</td>
          <td width={'75%'}>{itemData.process_status}</td>
        </tr>
        <tr>
          <td width={'20%'}>{t('Status')}</td>
          <td width={'5%'}>:</td>
          <td width={'75%'}>{StatusEnum[itemData.status]}</td>
        </tr>
        <tr>
          <td width={'20%'}>{t('Created Time')}</td>
          <td width={'5%'}>:</td>
          <td width={'75%'}>
            {DateTimeUtils.formatDateTimeA(itemData.created_at)}
          </td>
        </tr>
        <tr>
          <td width={'20%'}>{t('Updated Time')}</td>
          <td width={'5%'}>:</td>
          <td width={'75%'}>
            {DateTimeUtils.formatDateTimeA(itemData.updated_at)}
          </td>
        </tr>
      </table>
    </div>
  );
};
export default React.memo(StockTransferViewTab);
