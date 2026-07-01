import React, { FC } from 'react';
import { DateTimeUtils } from 'src/app/utils';
import EditAction from 'src/app/components/Actions/EditAction';
import DeleteAction from 'src/app/components/Actions/DeleteAction';
import { GovtHolidayAction } from '../Actions/GovtHoliday.actions';
import { useLang } from 'src/app/hooks/useLang';

const GovtHolidayView: FC<any> = (props) => {
  const { itemData, handleCallbackFunc } = props;
  const { t } = useLang();
  return (
    <div className="card card-body position-relative">
      <div className="row mb-7">
        <div className="col-lg-12">
          <EditAction
            entityId={itemData.id}
            actionItem={GovtHolidayAction.COMMON_ACTION.EDIT}
            handleCallbackFunc={handleCallbackFunc}
          />
          <DeleteAction
            entityId={itemData.id}
            actionItem={GovtHolidayAction.COMMON_ACTION.DELETE}
            handleCallbackFunc={handleCallbackFunc}
          />
        </div>
      </div>
      <div className="table-responsive">
        <table className="table table-row-dashed table-row-gray-300 align-middle gs-0 gy-4">
          <tr>
            <td width={'20%'}>{t('Holiday Name')}</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>{itemData.name}</td>
          </tr>
          <tr>
            <td width={'20%'}>{t('Date')}</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>{DateTimeUtils.formatDate(itemData.date)}</td>
          </tr>
          <tr>
            <td width={'20%'}>{t('Holiday Type')}</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>
              {itemData.holiday_type === 'government_holiday'
                ? t('Government Holiday')
                : t('Weekend Holiday')}
            </td>
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
export default React.memo(GovtHolidayView);
