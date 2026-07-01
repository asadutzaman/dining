import React, { FC } from 'react';
import { DateTimeUtils } from 'src/app/utils';
import { StatusEnum } from 'src/app/utils/enums';
import { useLang } from 'src/app/hooks/useLang';

const AttributeViewTab: FC<any> = (props) => {
  const { itemData } = props;
  const { t } = useLang();

  return (
    <div className="table-responsive">
      <table className="table table-row-dashed table-row-gray-300 align-middle gs-0 gy-1">
        <tr>
          <td width={'20%'}>{t('Attribute')}</td>
          <td width={'5%'}>:</td>
          <td width={'75%'}>{itemData.name}</td>
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
export default React.memo(AttributeViewTab);
