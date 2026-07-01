import React, { FC } from 'react';
import { DateTimeUtils } from 'src/app/utils';
import { StatusEnum } from 'src/app/utils/enums';
import EditAction from 'src/app/components/Actions/EditAction';
import DeleteAction from 'src/app/components/Actions/DeleteAction';
import { ShelveAction } from '../Actions/Shelve.actions';
import { useLang } from 'src/app/hooks/useLang';

const ShelveView: FC<any> = (props) => {
  const { itemData, handleCallbackFunc } = props;
  const { t } = useLang();

  return (
    <div className="card card-body position-relative">
      <div className="row mb-7">
        <div className="col-lg-12">
          <EditAction
            entityId={itemData.id}
            actionItem={ShelveAction.COMMON_ACTION.EDIT}
            handleCallbackFunc={handleCallbackFunc}
          />
          <DeleteAction
            entityId={itemData.id}
            actionItem={ShelveAction.COMMON_ACTION.DELETE}
            handleCallbackFunc={handleCallbackFunc}
          />
        </div>
      </div>
      <div className="table-responsive">
        <table className="table table-row-dashed table-row-gray-300 align-middle gs-0 gy-1">
          <tr>
            <td width={'20%'}>{t('Shelve Name')}</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>{itemData.name}</td>
          </tr>
          <tr>
            <td width={'20%'}>{t('Branch')}</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>{itemData.branch_name}</td>
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
    </div>
  );
};
export default React.memo(ShelveView);
