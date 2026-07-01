import React, { FC } from 'react';
import { useLang } from 'src/app/hooks/useLang';
import { DateTimeUtils } from 'src/app/utils';

const ItemConsumptionView: FC<any> = (props) => {
  const { t, lang } = useLang();
  const { itemData } = props;
  return (
    <div className="card card-body position-relative">
      <div className="table-responsive">
        <table className="table table-row-dashed table-row-gray-300 align-middle gs-0 gy-1">
          <tr>
            <td width={'20%'}>{t('Item Name')}</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>
              {lang === 'en' ? itemData.item_name_en : itemData.item_name_bn}
            </td>
          </tr>
          <tr>
            <td width={'20%'}>{t('Branch')}</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>{itemData.branch_name}</td>
          </tr>
          <tr>
            <td width={'20%'}>{t('Quantity')}</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>{itemData.quantity}</td>
          </tr>
          <tr>
            <td width={'20%'}>{t('Remarks')}</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>{itemData.remarks}</td>
          </tr>
          <tr>
            <td width={'20%'}>{t('Created By')}</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>{itemData.created_by_name}</td>
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
    </div>
  );
};
export default React.memo(ItemConsumptionView);
