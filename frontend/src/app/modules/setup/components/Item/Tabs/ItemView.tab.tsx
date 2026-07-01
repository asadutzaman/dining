import React, { FC } from 'react';
import { useLang } from 'src/app/hooks/useLang';
import { DateTimeUtils } from 'src/app/utils';
import { StatusEnum } from 'src/app/utils/enums';

const ItemViewTab: FC<any> = (props) => {
  const { itemData } = props;
  const { t } = useLang();

  return (
    <div className="table-responsive">
      <table className="table table-row-dashed table-row-gray-300 align-middle gs-0 gy-1">
        <tr>
          <td width={'20%'}>{t('Name')}</td>
          <td width={'5%'}>:</td>
          <td width={'75%'}>{itemData.name_en}</td>
        </tr>

        <tr>
          <td width={'20%'}>{t('Type')}</td>
          <td width={'5%'}>:</td>
          <td width={'75%'}>{itemData.type}</td>
        </tr>

        <tr>
          <td width={'20%'}>{t('Logistic')}</td>
          <td width={'5%'}>:</td>
          <td width={'75%'}>{itemData.logistic_name}</td>
        </tr>

        <tr>
          <td width={'20%'}>{t('Item Category')}</td>
          <td width={'5%'}>:</td>
          <td width={'75%'}>{itemData.item_category_name}</td>
        </tr>

        <tr>
          <td width={'20%'}>{t('Brand')}</td>
          <td width={'5%'}>:</td>
          <td width={'75%'}>{itemData.brand_name}</td>
        </tr>

        <tr>
          <td width={'20%'}>{t('Base Unit')}</td>
          <td width={'5%'}>:</td>
          <td width={'75%'}>{itemData.base_unit_sort_name}</td>
        </tr>

        <tr>
          <td width={'20%'}>{t('Re-order Qty')}</td>
          <td width={'5%'}>:</td>
          <td width={'75%'}>{itemData.reorder_qty}</td>
        </tr>

        <tr>
          <td width={'20%'}>{t('Description')}</td>
          <td width={'5%'}>:</td>
          <td width={'75%'}>{itemData.description}</td>
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
export default React.memo(ItemViewTab);
